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
  CropFree as CropFreeIcon,
  DragIndicator as DragIndicatorIcon,
  AspectRatio as AspectRatioIcon,
  ZoomOutMap as ZoomOutMapIcon,
  UnfoldMore as UnfoldMoreIcon,
  OpenWith as OpenWithIcon,
} from "@mui/icons-material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { useTheme } from "@mui/material/styles";
import {
  Chart,
  ChartType,
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

declare module "chart.js" {
  interface PluginOptionsByType<TType extends ChartType> {
    resizeHandles?: {
      size?: number;
      fillStyle?: string;
      strokeStyle?: string;
    };
  }
}

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
  lineColor?: string; // Цвет основной линии графика
  selectionColor?: string; // Цвет выделения интервала
  showStatus?: boolean;
}

export const CustomChart = ({
  title,
  data,
  unit,
  verticalLines = [],
  highlightIntervals = [],
  initialRange,
  selectionColor = "#4CAF50", // Material Green 500
  lineColor,
  showStatus = true,
}: MetricCardProps) => {
  const theme = useTheme();
  const mainChartRef = useRef<HTMLCanvasElement | null>(null);
  const mainChartInstance = useRef<Chart | null>(null);
  const miniChartRef = useRef<HTMLCanvasElement | null>(null);
  const miniChartInstance = useRef<Chart | null>(null);

  if (!lineColor) lineColor = theme.palette.primary.main;

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

  const resizeHandlesPlugin = {
    id: "resizeHandles",
    afterDraw: (chart: Chart) => {
      const ctx = chart.ctx;
      const annotation = (
        chart.options.plugins?.annotation?.annotations as Record<string, any>
      )?.selectionBox;

      if (!annotation) return;

      const xScale = chart.scales.x;
      const left = xScale.getPixelForValue(annotation.xMin);
      const right = xScale.getPixelForValue(annotation.xMax);
      const { top, bottom } = chart.chartArea;
      const handleSize = chart.options.plugins?.resizeHandles?.size || 8;
      const handleY = top + (bottom - top) / 2;

      ctx.save();
      ctx.fillStyle =
        chart.options.plugins?.resizeHandles?.fillStyle ||
        annotation.borderColor;
      ctx.strokeStyle =
        chart.options.plugins?.resizeHandles?.strokeStyle || "#ffffff";
      ctx.lineWidth = 1.5;

      // Left handle
      ctx.beginPath();
      ctx.arc(left, handleY, handleSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Right handle
      ctx.beginPath();
      ctx.arc(right, handleY, handleSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    },
  };

  Chart.register(resizeHandlesPlugin);

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
    // Используем selectionColor с прозрачностью
    ctx.fillStyle = `${selectionColor || theme.palette.primary.main}30`;
    ctx.fillRect(start, top, end - start, bottom - top);
    ctx.strokeStyle = selectionColor || theme.palette.primary.main;
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
            // Используем selectionColor с прозрачностью
            backgroundColor: `${
              selectionColor || theme.palette.primary.main
            }55`,
            borderWidth: 1,
            borderColor: selectionColor || theme.palette.primary.main,
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
                borderColor: lineColor,
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
              resizeHandles: {
                size: 8,
                fillStyle: selectionColor,
                strokeStyle: theme.palette.background.paper,
              } as any,
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
                borderColor: lineColor,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: lineColor,
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
          {showStatus && (
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
          )}
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
          <Box sx={{ p: 2, maxWidth: 320, bgcolor: "background.paper" }}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "text.primary",
              }}
            >
              <HelpOutlineIcon fontSize="small" color="primary" />
              Управление графиком
            </Typography>

            <Divider sx={{ my: 1 }} />

            {/* Основные взаимодействия */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{
                  fontWeight: 500,
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1.5,
                }}
              >
                <ZoomInIcon fontSize="small" />
                Масштабирование
              </Typography>

              <Box sx={{ pl: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 1,
                  }}
                >
                  <PanToolIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 500 }}>
                      Выделение области:
                    </Box>{" "}
                    ЛКМ + перетаскивание
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 1,
                  }}
                >
                  <MouseIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 500 }}>
                      Колёсико:
                    </Box>{" "}
                    Ctrl + прокрутка
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <AspectRatioIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 500 }}>
                      Сброс:
                    </Box>{" "}
                    Двойной клик
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Навигация */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{
                  fontWeight: 500,
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1.5,
                }}
              >
                <DragIndicatorIcon fontSize="small" />
                Перемещение
              </Typography>

              <Box sx={{ pl: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 1,
                  }}
                >
                  <SwapHorizIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 500 }}>
                      Панорамирование:
                    </Box>{" "}
                    ПКМ + перетаскивание
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <CropFreeIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 500 }}>
                      Прокрутка:
                    </Box>{" "}
                    Shift + колёсико
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Мини-карта */}
            <Box>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{
                  fontWeight: 500,
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1.5,
                }}
              >
                <ZoomOutMapIcon fontSize="small" />
                Область просмотра
              </Typography>

              <Box sx={{ pl: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 1,
                  }}
                >
                  <UnfoldMoreIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 500 }}>
                      Изменение размера:
                    </Box>{" "}
                    Тяните за границы
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <OpenWithIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 500 }}>
                      Перемещение:
                    </Box>{" "}
                    Тяните за область
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                fontStyle: "italic",
              }}
            >
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
