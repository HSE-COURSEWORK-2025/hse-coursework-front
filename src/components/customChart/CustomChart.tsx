import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from 'recharts';
import { Paper, Typography, useTheme, Box, IconButton } from '@mui/material';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';

// Типы данных
interface ChartData {
  x: number | string;
  y: number;
}

interface ChartProps {
  data: ChartData[];
  title: string;
  xLabel?: string;
  yLabel?: string;
  highlightArea?: { x1: number | string; x2: number | string };
  verticalLines?: { x: number | string; label?: string }[];
}

export const CustomChart = ({
  data,
  title,
  xLabel,
  yLabel,
  highlightArea,
  verticalLines = [],
}: ChartProps) => {
  const theme = useTheme();
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 4,
        position: 'relative',
        transition: theme.transitions.create('all'),
      }}
      elevation={3}
    >
      {/* Заголовок и элементы управления */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <IconButton onClick={() => setIsZoomed(!isZoomed)} size="small">
          <ZoomOutMapIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Контейнер графика */}
      <Box sx={{ height: isZoomed ? '70vh' : 400, transition: 'height 0.3s' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            {/* Сетка */}
            <CartesianGrid
              stroke={theme.palette.divider}
              strokeDasharray="3 3"
            />

            {/* Оси */}
            <XAxis
              dataKey="x"
              label={{
                value: xLabel,
                position: 'bottom',
                fill: theme.palette.text.secondary,
              }}
              tick={{ fill: theme.palette.text.secondary }}
            />
            <YAxis
              label={{
                value: yLabel,
                angle: -90,
                position: 'left',
                fill: theme.palette.text.secondary,
              }}
              tick={{ fill: theme.palette.text.secondary }}
            />

            {/* Выделенная область */}
            {highlightArea && (
              <ReferenceArea
                x1={highlightArea.x1}
                x2={highlightArea.x2}
                fill={theme.palette.action.selected}
                fillOpacity={0.3}
              />
            )}

            {/* Вертикальные линии */}
            {verticalLines.map((line, index) => (
              <ReferenceLine
                key={index}
                x={line.x}
                stroke={theme.palette.error.main}
                strokeWidth={1.5}
                strokeDasharray="5 5"
                label={{
                  value: line.label,
                  fill: theme.palette.text.primary,
                  position: 'top',
                }}
              />
            ))}

            {/* Всплывающая подсказка */}
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: theme.shape.borderRadius,
                boxShadow: theme.shadows[3],
              }}
            />

            {/* Линия графика */}
            <Line
              type="monotone"
              dataKey="y"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={{ fill: theme.palette.primary.dark, strokeWidth: 1 }}
              activeDot={{
                r: 6,
                fill: theme.palette.primary.main,
                stroke: theme.palette.background.paper,
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

// Пример использования
const sampleData = [
  { x: 'Jan', y: 4000 },
  { x: 'Feb', y: 3000 },
  { x: 'Mar', y: 5000 },
  { x: 'Apr', y: 2780 },
  { x: 'May', y: 1890 },
];

// export const ExampleChart = () => (
//   <CustomChart
//     title="Продажи за 2023 год"
//     data={sampleData}
//     xLabel="Месяц"
//     yLabel="Продажи ($)"
//     highlightArea={{ x1: 'Feb', x2: 'Apr' }}
//     verticalLines={[
//       { x: 'Mar', label: 'Пик продаж' },
//       { x: 'May', label: 'Минимум' },
//     ]}
//   />
// );