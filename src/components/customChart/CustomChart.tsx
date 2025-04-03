import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Popover,
  Box,
  Divider,
} from "@mui/material";
import {
  ZoomIn as ZoomInIcon,
  PanTool as PanToolIcon,
  Mouse as MouseIcon,
  Refresh as RefreshIcon,
  CropFree as CropFreeIcon,
  DragIndicator as DragIndicatorIcon,
  AspectRatio as AspectRatioIcon,
} from "@mui/icons-material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { useTheme } from "@mui/material/styles";
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
  const mainChartRef = useRef<HTMLCanvasElement | null>(null);
  const mainChartInstance = useRef<Chart | null>(null);
  const miniChartRef = useRef<HTMLCanvasElement | null>(null);
  const miniChartInstance = useRef<Chart | null>(null);

  // Состояния для выделения основного графика
  const [selection, setSelection] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Состояния для мини-графика (перетаскивание выделенного интервала)
  const [miniSelection, setMiniSelection] = useState<{
    start: number;
    end: number;
  }>({
    start: initialRange.min,
    end: initialRange.max,
  });
  const [isDraggingMini, setIsDraggingMini] = useState(false);
  const miniDragStartX = useRef<number | null>(null);
  const miniSelectionStartAtDrag = useRef<{
    start: number;
    end: number;
  } | null>(null);

  // Для ресайза одной из границ выделения
  // Хранит: какая граница ("left" или "right"), начальную позицию мыши и исходное значение границы, а также значение другой границы
  const resizingRef = useRef<{
    boundary: "left" | "right";
    initialX: number;
    initialValue: number;
    otherValue: number;
  } | null>(null);

  const extendValsPercent = 0.02;
  const dataX = data.map((d) => Number(d.x));
  const minX = Math.min(...dataX);
  const maxX = Math.max(...dataX);
  const fullDataMin = minX - minX * extendValsPercent;
  const fullDataMax = maxX + maxX * extendValsPercent;

  const handleMiniClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!miniChartInstance.current || isDraggingMini || resizingRef.current)
      return;

    const rect = miniChartRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const xScale = miniChartInstance.current.scales.x;
    const clickedValue = xScale.getValueForPixel(x);

    if (clickedValue === undefined || clickedValue === null) return;

    // Определяем пороговое расстояние в пикселях (10px)
    const thresholdPixels = 15;

    // Переводим границы интервала в пиксели
    const startPixel = xScale.getPixelForValue(miniSelection.start);
    const endPixel = xScale.getPixelForValue(miniSelection.end);

    // Вычисляем расстояние до ближайшей границы
    const distanceToStart = Math.abs(x - startPixel);
    const distanceToEnd = Math.abs(x - endPixel);
    const minDistance = Math.min(distanceToStart, distanceToEnd);

    // Если клик слишком близко к границе - игнорируем
    if (minDistance < thresholdPixels) return;

    // Если клик внутри интервала или слишком близко к границам - не перемещаем
    if (
      clickedValue >= miniSelection.start &&
      clickedValue <= miniSelection.end
    )
      return;

    // Остальная логика перемещения...
    const currentWidth = miniSelection.end - miniSelection.start;
    const newStart = Math.max(fullDataMin, clickedValue - currentWidth / 2);
    const newEnd = Math.min(fullDataMax, newStart + currentWidth);

    // Корректировка если выходим за границы
    const finalStart =
      newEnd > fullDataMax ? fullDataMax - currentWidth : newStart;
    const finalEnd = finalStart + currentWidth;

    setMiniSelection({
      start: finalStart,
      end: finalEnd,
    });

    if (mainChartInstance.current) {
      mainChartInstance.current.zoomScale("x", {
        min: finalStart,
        max: finalEnd,
      });
    }
  };

  // --- Основной график ---
  const handleMainMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mainChartInstance.current) return;
    const xAxis = mainChartInstance.current.scales.x;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
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

  const handleMainMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mainChartInstance.current) return;
    const xAxis = mainChartInstance.current.scales.x;
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

  const handleMainMouseUp = () => {
    if (isSelecting && selection && mainChartInstance.current) {
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
        mainChartInstance.current.zoomScale("x", {
          min: clampedStart,
          max: clampedEnd,
        });
        setMiniSelection({ start: clampedStart, end: clampedEnd });
      }
    }
    setIsSelecting(false);
    setSelection(null);
  };

  const drawMainSelection = (chart: Chart) => {
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

  // Обработка колёсика в основном графике (Shift+wheel для панорамирования)
  const handleMainWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (e.shiftKey && mainChartInstance.current) {
      e.preventDefault();
      const xScale = mainChartInstance.current.scales.x;
      const range = xScale.max - xScale.min;
      const panFactor = (range * 0.05 * e.deltaY) / 100;
      let newMin = xScale.min + panFactor;
      let newMax = xScale.max + panFactor;
      if (newMin < fullDataMin) {
        newMin = fullDataMin;
        newMax = newMin + range;
      }
      if (newMax > fullDataMax) {
        newMax = fullDataMax;
        newMin = newMax - range;
      }
      mainChartInstance.current.zoomScale("x", { min: newMin, max: newMax });
      setMiniSelection({ start: newMin, end: newMax });
    }
  };

  // --- Мини-график ---
  // Создаём мини-график один раз при монтировании или при изменении данных/темы
  useEffect(() => {
    if (miniChartRef.current) {
      const ctx = miniChartRef.current.getContext("2d");
      if (ctx) {
        if (miniChartInstance.current) {
          miniChartInstance.current.destroy();
        }
        // Формируем аннотации для мини-графика
        const miniAnnotations: Record<string, any> = {
          selectionBox: {
            type: "box",
            xMin: miniSelection.start,
            xMax: miniSelection.end,
            backgroundColor: `${theme.palette.primary.main}55`,
            borderWidth: 1,
            borderColor: theme.palette.primary.main,
          },
        };

        highlightIntervals.forEach((interval, idx) => {
          miniAnnotations[`highlightInterval${idx}`] = {
            type: "box",
            xMin: interval.start,
            xMax: interval.end,
            backgroundColor: `${theme.palette.error.main}33`,
            borderColor: theme.palette.error.main,
            borderWidth: 1,
            label: {
              content: `Interval ${idx + 1}`,
              display: true,
              position: "start",
              color: theme.palette.text.primary,
              font: { size: 10 },
            },
          };
        });

        verticalLines.forEach((line, idx) => {
          miniAnnotations[`verticalLine${idx}`] = {
            type: "line",
            xMin: Number(line),
            xMax: Number(line),
            borderColor: theme.palette.error.main,
            borderWidth: 1.5,
            borderDash: [5, 3],
            label: {
              content: `Event ${idx + 1}`,
              position: "start",
              color: theme.palette.text.primary,
              font: { size: 12 },
            },
          };
        });

        miniChartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: data.map((d) => d.x),
            datasets: [
              {
                label: title,
                data: data.map((d) => d.y),
                borderColor: theme.palette.primary.main,
                tension: 0.4,
                borderWidth: 1,
                pointRadius: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false },
              annotation: {
                annotations: miniAnnotations,
              },
            },
            scales: {
              x: {
                type: "linear",
                min: fullDataMin,
                max: fullDataMax,
                grid: { display: false },
                ticks: { display: false },
              },
              y: {
                display: false,
              },
            },
          },
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data,
    theme,
    title,
    fullDataMin,
    fullDataMax,
    highlightIntervals,
    verticalLines,
  ]);

  // Обновление аннотации мини-графика при изменении miniSelection без полной перерисовки
  useEffect(() => {
    if (miniChartInstance.current) {
      const ann = miniChartInstance.current.options.plugins?.annotation
        ?.annotations as Record<string, any> | undefined;
      if (ann?.selectionBox) {
        ann.selectionBox.xMin = miniSelection.start;
        ann.selectionBox.xMax = miniSelection.end;
        miniChartInstance.current.update("none");
      }
    }
  }, [miniSelection]);

  // Логика перетаскивания всего выделенного интервала или изменения отдельной его границы на мини-графике
  const handleMiniMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!miniChartInstance.current || resizingRef.current) return;
    const rect = miniChartRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const xScale = miniChartInstance.current.scales.x;
    if (!xScale) return;
    // Определяем пиксельные координаты левой и правой границы выделенного интервала
    const leftPixel = xScale.getPixelForValue(miniSelection.start);
    const rightPixel = xScale.getPixelForValue(miniSelection.end);
    const threshold = 5; // в пикселях

    // Если мышь рядом с левой границей – начинаем ресайз левой границы
    if (Math.abs(x - leftPixel) <= threshold) {
      resizingRef.current = {
        boundary: "left",
        initialX: x,
        initialValue: miniSelection.start,
        otherValue: miniSelection.end,
      };
      return;
    }
    // Если мышь рядом с правой границей – начинаем ресайз правой границы
    if (Math.abs(x - rightPixel) <= threshold) {
      resizingRef.current = {
        boundary: "right",
        initialX: x,
        initialValue: miniSelection.end,
        otherValue: miniSelection.start,
      };
      return;
    }
    // Если не в зоне ресайза – начинаем перемещение всего выделенного интервала
    setIsDraggingMini(true);
    miniDragStartX.current = x;
    miniSelectionStartAtDrag.current = { ...miniSelection };
  };

  const handleMiniMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!miniChartInstance.current) return;
    const rect = miniChartRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const xScale = miniChartInstance.current.scales.x;
    if (!xScale) return;
    // Если идёт ресайз границы
    if (resizingRef.current) {
      const dx = x - resizingRef.current.initialX;
      const valueAtZero = xScale.getValueForPixel(0);
      const valueAtDx = xScale.getValueForPixel(dx);
      if (valueAtZero === undefined || valueAtDx === undefined) return;
      // Инвертированное вычисление смещения
      const deltaValue = valueAtDx - valueAtZero;
      const minRange = 1; // минимально допустимый интервал
      if (resizingRef.current.boundary === "left") {
        let newLeft = resizingRef.current.initialValue + deltaValue;
        if (newLeft > resizingRef.current.otherValue - minRange) {
          newLeft = resizingRef.current.otherValue - minRange;
        }
        if (newLeft < fullDataMin) {
          newLeft = fullDataMin;
        }
        setMiniSelection({ start: newLeft, end: miniSelection.end });
        if (mainChartInstance.current) {
          mainChartInstance.current.zoomScale("x", {
            min: newLeft,
            max: miniSelection.end,
          });
        }
      } else if (resizingRef.current.boundary === "right") {
        let newRight = resizingRef.current.initialValue + deltaValue;
        if (newRight < resizingRef.current.otherValue + minRange) {
          newRight = resizingRef.current.otherValue + minRange;
        }
        if (newRight > fullDataMax) {
          newRight = fullDataMax;
        }
        setMiniSelection({ start: miniSelection.start, end: newRight });
        if (mainChartInstance.current) {
          mainChartInstance.current.zoomScale("x", {
            min: miniSelection.start,
            max: newRight,
          });
        }
      }
      return;
    }
    // Если перетаскивание всего интервала
    if (isDraggingMini && miniSelectionStartAtDrag.current) {
      const dx = x - (miniDragStartX.current || 0);
      const valueAtZero = xScale.getValueForPixel(0);
      const valueAtDx = xScale.getValueForPixel(dx);
      if (valueAtZero === undefined || valueAtDx === undefined) return;
      // Инвертированное вычисление смещения
      const deltaValue = valueAtDx - valueAtZero;
      let newStart = miniSelectionStartAtDrag.current.start + deltaValue;
      let newEnd = miniSelectionStartAtDrag.current.end + deltaValue;
      const range = newEnd - newStart;
      if (newStart < fullDataMin) {
        newStart = fullDataMin;
        newEnd = newStart + range;
      }
      if (newEnd > fullDataMax) {
        newEnd = fullDataMax;
        newStart = newEnd - range;
      }
      setMiniSelection({ start: newStart, end: newEnd });
      if (mainChartInstance.current) {
        mainChartInstance.current.zoomScale("x", {
          min: newStart,
          max: newEnd,
        });
      }
    }
  };

  const handleMiniMouseUp = () => {
    setIsDraggingMini(false);
    miniDragStartX.current = null;
    miniSelectionStartAtDrag.current = null;
    resizingRef.current = null;
  };

  // Создаём основной график
  useEffect(() => {
    if (mainChartRef.current) {
      const ctx = mainChartRef.current.getContext("2d");
      if (ctx) {
        if (mainChartInstance.current) {
          mainChartInstance.current.destroy();
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
        mainChartInstance.current = new Chart(ctx, {
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
            transitions: { zoom: { animation: { duration: 300 } } },
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
                  onZoomComplete: ({ chart }) => {
                    setMiniSelection({
                      start: chart.scales.x.min,
                      end: chart.scales.x.max,
                    });
                  },
                },
                pan: { enabled: false },
                limits: {
                  x: { min: fullDataMin, max: fullDataMax, minRange: 3 },
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
                grid: { color: theme.palette.divider, tickLength: 0 },
                ticks: {
                  color: theme.palette.text.secondary,
                  autoSkip: true,
                  maxRotation: 0,
                  callback: (value) => Number(value).toFixed(1),
                },
              },
              y: {
                title: { display: false },
                grid: { color: theme.palette.divider, tickLength: 0 },
                ticks: { color: theme.palette.text.secondary, padding: 8 },
              },
            },
          },
        });
        if (initialRange) {
          mainChartInstance.current.zoomScale("x", {
            min: initialRange.min,
            max: initialRange.max,
          });
        }
        const originalDraw = mainChartInstance.current.draw;
        mainChartInstance.current.draw = function () {
          originalDraw.call(this);
          drawMainSelection(this);
        };
        const handleDoubleClick = () => {
          if (mainChartInstance.current) {
            mainChartInstance.current.zoomScale("x", {
              min: fullDataMin,
              max: fullDataMax,
            });
            setMiniSelection({ start: fullDataMin, end: fullDataMax });
          }
        };
        ctx.canvas.ondblclick = handleDoubleClick;
        ctx.canvas.oncontextmenu = (e) => e.preventDefault();
      }
    }
    return () => {
      if (mainChartInstance.current) {
        mainChartInstance.current.destroy();
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
    fullDataMin,
    fullDataMax,
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
        {/* Заголовок и подсказка */}
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
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Box sx={{ p: 2, maxWidth: 320 }}>
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Основной график
            </Typography>

            {/* Основные взаимодействия */}
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <ZoomInIcon fontSize="small" color="primary" />
                <Typography variant="caption">
                  Выделение области - ЛКМ + протягивание
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <PanToolIcon fontSize="small" color="primary" />
                <Typography variant="caption">
                  Панорамирование - ПКМ + протягивание
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <MouseIcon fontSize="small" color="primary" />
                <Typography variant="caption">
                  Зумирование - Ctrl + колёсико мыши
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <SwapHorizIcon fontSize="small" color="primary" />
                <Typography variant="caption">
                  Горизонтальная прокрутка - Shift + колёсико
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <RefreshIcon fontSize="small" color="primary" />
                <Typography variant="caption">
                  Сброс зума - Двойной клик ЛКМ
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Мини-карта
            </Typography>

            {/* Взаимодействия с мини-картой */}
            <Box sx={{ mb: 1 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <CropFreeIcon fontSize="small" color="secondary" />
                <Typography variant="caption">
                  Перемещение области - ЛКМ + перетаскивание
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <DragIndicatorIcon fontSize="small" color="secondary" />
                <Typography variant="caption">
                  Изменение границ - Наведите на край и тяните
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AspectRatioIcon fontSize="small" color="secondary" />
                <Typography variant="caption">
                  Масштаб области = размеру выделения
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Общие подсказки */}
            <Typography variant="caption" color="textSecondary">
              * ЛКМ - Левая кнопка мыши
              <br />* ПКМ - Правая кнопка мыши
            </Typography>
          </Box>
        </Popover>

        {/* Основной график */}
        <Box
          sx={{
            position: "relative",
            height: 150,
            "&:hover": { cursor: "crosshair" },
          }}
        >
          <canvas
            ref={mainChartRef}
            onMouseDown={handleMainMouseDown}
            onMouseMove={handleMainMouseMove}
            onMouseUp={handleMainMouseUp}
            onMouseLeave={handleMainMouseUp}
            onWheel={handleMainWheel}
          />
        </Box>

        {/* Мини-график (обзор) – высота в 1/3 от основного */}
        <Box
          sx={{
            position: "relative",
            height: 50,
            mt: 2,
            "&:hover": { cursor: "pointer" },
          }}
        >
          <canvas
            ref={miniChartRef}
            onClick={handleMiniClick}
            onMouseDown={handleMiniMouseDown}
            onMouseMove={handleMiniMouseMove}
            onMouseUp={handleMiniMouseUp}
            onMouseLeave={handleMiniMouseUp}
          />
        </Box>

        {/* Информация о единицах и количестве точек */}
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
