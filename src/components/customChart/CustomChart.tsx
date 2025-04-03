import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Popover,
  Box,
} from "@mui/material";
import {
  ZoomIn as ZoomInIcon,
  PanTool as PanToolIcon,
  Mouse as MouseIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useTheme } from "@mui/material/styles";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import annotationPlugin from "chartjs-plugin-annotation";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  zoomPlugin,
  annotationPlugin
);

interface DataPoint {
  x: string;
  y: number;
}

interface MetricCardProps {
  title: string;
  data: DataPoint[];
  unit?: string;
  verticalLines?: string[];
  highlightIntervals: {
    start: number;
    end: number;
  }[];
  // Проп для начального интервала
  initialRange: {
    min: number;
    max: number;
  };
}

export const CustomChart = ({
  title,
  data,
  unit,
  verticalLines = [],
  highlightIntervals = [],
  initialRange,
}: MetricCardProps) => {
  const theme = useTheme();
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [selection, setSelection] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Состояния для панорамирования правой кнопкой мыши
  const [isPanning, setIsPanning] = useState(false);
  const [panStartPixel, setPanStartPixel] = useState<number | null>(null);
  const panStartRange = useRef<{ min: number; max: number } | null>(null);

  const extendValsPercent = 0.02;
  const dataX = data.map((d) => Number(d.x));
  const minX = Math.min(...dataX);
  const maxX = Math.max(...dataX);

  const fullDataMin = minX - minX * extendValsPercent;
  const fullDataMax = maxX + maxX * extendValsPercent;

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chartInstance.current) return;
    const xAxis = chartInstance.current.scales.x;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Если нажата левая кнопка мыши – начинаем выделение диапазона
    if (e.button === 0) {
      const rawIndex = xAxis.getValueForPixel(x);
      if (rawIndex === undefined || rawIndex === null) return;
      const index = Math.round(rawIndex);
      if (index < 0 || index >= data.length) return;
      const xValue = data[index].x;
      const value = Number(xValue);
      if (!isNaN(value)) {
        setIsSelecting(true);
        setSelection({ start: value, end: value });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chartInstance.current) return;
    const xAxis = chartInstance.current.scales.x;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (isSelecting) {
      const rawIndex = xAxis.getValueForPixel(x);
      if (rawIndex === undefined || rawIndex === null) return;
      const index = Math.round(rawIndex);
      if (index < 0 || index >= data.length) return;
      const xValue = data[index].x;
      const value = Number(xValue);
      if (!isNaN(value)) {
        setSelection((prev) => {
          if (!prev) return null;
          return { ...prev, end: value };
        });
      }
    }
  };

  const handleMouseUp = (e?: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSelecting && selection && chartInstance.current) {
      const minDistance = 1;
      const [start, end] = [
        Math.min(selection.start, selection.end),
        Math.max(selection.start, selection.end),
      ];
      const firstX = Number(data[0].x);
      const lastX = Number(data[data.length - 1].x);
      const clampedStart = Math.max(firstX, start);
      const clampedEnd = Math.min(lastX, end);
      if (Math.abs(clampedEnd - clampedStart) >= minDistance) {
        chartInstance.current.zoomScale("x", {
          min: clampedStart,
          max: clampedEnd,
        });
      }
    }
    setIsSelecting(false);
    setSelection(null);
    if (isPanning) {
      setIsPanning(false);
      setPanStartPixel(null);
      panStartRange.current = null;
    }
  };

  const drawSelection = (chart: Chart) => {
    if (!selection || !isSelecting) return;
    const { ctx } = chart;
    const { top, bottom } = chart.chartArea;
    const xAxis = chart.scales.x;
    const start = xAxis.getPixelForValue(selection.start);
    const end = xAxis.getPixelForValue(selection.end);
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = `${theme.palette.primary.main}30`;
    ctx.fillRect(start, top, end - start, bottom - top);
    ctx.strokeStyle = theme.palette.primary.main;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(start, top, end - start, bottom - top);
    ctx.restore();
  };

  // Обработка колёсика мыши при зажатом Shift для панорамирования
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (e.shiftKey && chartInstance.current) {
      e.preventDefault();
      const xScale = chartInstance.current.scales.x;
      const range = xScale.max - xScale.min;
      // Коэффициент панорамирования: 5% от диапазона за каждые 100 единиц дельты
      const panFactor = (range * 0.05 * e.deltaY) / 100;
      let newMin = xScale.min + panFactor;
      let newMax = xScale.max + panFactor;
      // Ограничиваем диапазон, чтобы не выйти за пределы полного диапазона
      if (newMin < fullDataMin) {
        newMin = fullDataMin;
        newMax = newMin + range;
      }
      if (newMax > fullDataMax) {
        newMax = fullDataMax;
        newMin = newMax - range;
      }
      chartInstance.current.zoomScale("x", {
        min: newMin,
        max: newMax,
      });
    }
  };

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
        const annotations = [
          ...highlightIntervals.map((interval, idx) => ({
            type: "box" as const,
            xMin: interval.start,
            xMax: interval.end,
            backgroundColor: `${theme.palette.error.main}33`,
            borderColor: theme.palette.error.main,
            borderWidth: 1,
            label: {
              content: `Interval ${idx + 1}`,
              display: true,
              position: "start" as const,
              color: theme.palette.text.primary,
              font: { size: 10 },
            },
          })),
          ...verticalLines.map((line, idx) => ({
            type: "line" as const,
            xMin: Number(line),
            xMax: Number(line),
            borderColor: theme.palette.error.main,
            borderWidth: 1.5,
            borderDash: [5, 3],
            label: {
              content: `Event ${idx + 1}`,
              position: "start" as const,
              color: theme.palette.text.primary,
              font: { size: 12 },
            },
          })),
        ];
        chartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: data.map((d) => d.x),
            datasets: [
              {
                label: title,
                data: data.map((d) => d.y),
                borderColor: theme.palette.primary.main,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: theme.palette.primary.main,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            transitions: {
              zoom: { animation: { duration: 300 } },
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: theme.palette.background.paper,
                titleColor: theme.palette.text.primary,
                bodyColor: theme.palette.text.secondary,
                borderColor: theme.palette.divider,
                borderWidth: 1,
                callbacks: {
                  title: (items) => `X: ${items[0].label}`,
                  label: (item) =>
                    `${item.dataset.label}: ${item.formattedValue} ${unit}`,
                },
              },
              zoom: {
                zoom: {
                  wheel: { enabled: true, modifierKey: "ctrl" },
                  pinch: { enabled: true },
                  drag: {
                    enabled: true,
                    modifierKey: undefined,
                    backgroundColor: `${theme.palette.primary.main}30`,
                  },
                  mode: "x",
                },
                pan: {
                  enabled: false,
                },
                limits: {
                  x: {
                    min: fullDataMin,
                    max: fullDataMax,
                    minRange: 3,
                  },
                },
              },
              annotation: { annotations },
            },
            scales: {
              x: {
                type: "linear",
                title: { display: false },
                min: initialRange ? initialRange.min : fullDataMin,
                max: initialRange ? initialRange.max : fullDataMax,
                grid: {
                  color: theme.palette.divider,
                  tickLength: 0,
                },
                ticks: {
                  color: theme.palette.text.secondary,
                  autoSkip: true,
                  maxRotation: 0,
                  callback: (value) => Number(value).toFixed(1),
                },
              },
              y: {
                title: { display: false },
                grid: {
                  color: theme.palette.divider,
                  tickLength: 0,
                },
                ticks: {
                  color: theme.palette.text.secondary,
                  padding: 8,
                },
              },
            },
          },
        });

        // Если задан начальный диапазон, устанавливаем его сразу после создания графика
        if (initialRange) {
          chartInstance.current.zoomScale("x", {
            min: initialRange.min,
            max: initialRange.max,
          });
        }

        const originalDraw = chartInstance.current.draw;
        chartInstance.current.draw = function () {
          originalDraw.call(this);
          drawSelection(this);
        };

        // При двойном клике масштабируем до полного диапазона (всех точек)
        const handleDoubleClick = () => {
          if (chartInstance.current) {
            chartInstance.current.zoomScale("x", {
              min: fullDataMin,
              max: fullDataMax,
            });
          }
        };
        ctx.canvas.ondblclick = handleDoubleClick;
        ctx.canvas.oncontextmenu = (e) => e.preventDefault();
      }
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [
    data,
    theme,
    title,
    unit,
    verticalLines,
    highlightIntervals,
    initialRange,
  ]);

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 2,
        "&:hover": { boxShadow: theme.shadows[4] },
        position: "relative",
      }}
    >
      <CardContent sx={{ position: "relative" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
            position: "relative",
          }}
        >
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Box
            sx={{
              bgcolor:
                verticalLines?.length || highlightIntervals?.length
                  ? theme.palette.error.light
                  : theme.palette.success.light,
              color:
                verticalLines?.length || highlightIntervals?.length
                  ? theme.palette.error.contrastText
                  : theme.palette.success.contrastText,
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: "0.75rem",
              fontWeight: 500,
              lineHeight: 1.5,
              display: "inline-flex",
              alignItems: "center",
              boxShadow: theme.shadows[1],
              transition: "all 0.2s ease",
            }}
          >
            {verticalLines?.length || highlightIntervals?.length
              ? "не ОК"
              : "ОК"}
          </Box>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setAnchorEl(e.currentTarget);
            }}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: theme.palette.background.paper,
              "&:hover": { bgcolor: theme.palette.grey[300] },
              zIndex: 1,
            }}
          >
            <HelpOutlineIcon />
          </IconButton>
        </Box>
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          disableEnforceFocus
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" display="flex" alignItems="center">
              <ZoomInIcon fontSize="small" sx={{ mr: 0.5 }} /> Левой кнопкой
              мыши: выделение области для увеличения (зумирование).
            </Typography>
            <Typography variant="caption" display="flex" alignItems="center">
              <PanToolIcon fontSize="small" sx={{ mr: 0.5 }} /> Правой кнопкой
              мыши: перетаскивание (панорамирование) графика влево/вправо.
            </Typography>
            <Typography variant="caption" display="flex" alignItems="center">
              <MouseIcon fontSize="small" sx={{ mr: 0.5 }} /> Колёсико мыши (с
              зажатым Ctrl): зумирование колесиком.
            </Typography>
            <Typography variant="caption" display="flex" alignItems="center">
              <RefreshIcon fontSize="small" sx={{ mr: 0.5 }} /> Двойной клик:
              сброс зума.
            </Typography>
            <Typography variant="caption" display="flex" alignItems="center">
              <SwapHorizIcon fontSize="small" sx={{ mr: 0.5 }} /> При зажатом
              Shift и кручении колесика мыши: перемещение выбранного диапазона
              влево/вправо.
            </Typography>
          </Box>
        </Popover>

        <Box
          sx={{
            position: "relative",
            height: 150,
            "&:hover": { cursor: "crosshair" },
          }}
        >
          <canvas
            ref={chartRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />
        </Box>

        <Box
          sx={{
            mt: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {unit && (
            <Typography variant="caption" color="text.secondary">
              Единицы измерения: {unit}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            {`${data.length} точек данных`}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
