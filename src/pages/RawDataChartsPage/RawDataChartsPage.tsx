import {
  Box,
  Card,
  CardContent,
  Container,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceArea,
  Area,
  ReferenceLine,
  AreaChart,
} from "recharts";
import { useTheme } from "@mui/material/styles";

// Данные для графиков
const pulseData = [
  { year: "2013", value: 72 },
  { year: "2014", value: 68 },
  { year: "2015", value: 75 },
  { year: "2016", value: 70 },
];

const oxygenData = [
  { year: "2013", value: 98 },
  { year: "2014", value: 97 },
  { year: "2015", value: 96 },
  { year: "2016", value: 95 },
];

const stressData = [
  { year: "2013", value: 3.2 },
  { year: "2014", value: 2.8 },
  { year: "2015", value: 3.5 },
  { year: "2016", value: 2.9 },
];

const breathingData = [
  { year: "2013", value: 16 },
  { year: "2014", value: 15 },
  { year: "2015", value: 17 },
  { year: "2016", value: 14 },
];

const sleepData = [
  { year: "2013", value: 7.2 },
  { year: "2014", value: 6.8 },
  { year: "2015", value: 7.5 },
  { year: "2016", value: 6.9 },
];

interface MetricCardProps { 
  title: string; 
  data: { year: string; value: number }[];
  unit?: string;
  verticalLines?: string[];       // Массив позиций вертикальных линий
  highlightIntervals?: {         // Массив интервалов для выделения
    start: string;
    end: string;
  }[];
}

const MetricCard = ({ 
  title, 
  data, 
  unit,
  verticalLines = [],
  highlightIntervals = []
}: MetricCardProps) => {
  const theme = useTheme();

  return (
    <Card sx={{ 
      mb: 3, 
      borderRadius: 2,
      '&:hover': { boxShadow: theme.shadows[4] }
    }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        
        <Box sx={{ height: 150 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="year" 
                tick={{ fill: theme.palette.text.secondary }}
              />
              <YAxis 
                width={40}
                tick={{ fill: theme.palette.text.secondary }}
              />
              
              {/* Основная линия графика */}
              <Line
                type="monotone"
                dataKey="value"
                stroke={theme.palette.primary.main}
                strokeWidth={2}
                dot={false}
              />

              {/* Выделенные интервалы */}
              {highlightIntervals.map((interval, idx) => (
                <ReferenceArea
                  key={`area-${idx}`}
                  x1={interval.start}
                  x2={interval.end}
                  fill={theme.palette.error.main}
                  fillOpacity={0.2}
                  stroke={theme.palette.error.main}
                  strokeOpacity={0.5}
                />
              ))}

              {/* Вертикальные линии */}
              {verticalLines.map((linePos, idx) => (
                <ReferenceLine
                  key={`line-${idx}`}
                  x={linePos}
                  stroke={theme.palette.error.main}
                  strokeWidth={1.5}
                  strokeDasharray="5 3"
                  label={{
                    value: `Event ${idx + 1}`,
                    fill: theme.palette.text.primary,
                    position: 'top',
                    fontSize: 12
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {unit && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Единицы измерения: {unit}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export const RawDataChartsPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Жизненные показатели
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Анализ выбросов жизненных показателей
      </Typography>

      {/* Контейнер для карточек с flexbox. flexWrap позволяет перейти на новую строку */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ flex: "1 1 calc(50% - 16px)" }}>
          <MetricCard title="Пульс" data={pulseData} unit="уд/мин" verticalLines={['2015', '2016']}
            highlightIntervals={[
              { start: '2013', end: '2014' },
              { start: '2015', end: '2016' }
            ]}
 />
        </Box>
        <Box sx={{ flex: "1 1 calc(50% - 16px)" }}>
          <MetricCard
            title="Уровень кислорода в крови"
            data={oxygenData}
            unit="SpO2%"
          />
        </Box>
        <Box sx={{ flex: "1 1 calc(50% - 16px)" }}>
          <MetricCard
            title="Оценка уровня стресса"
            data={stressData}
            unit="баллы"
          />
        </Box>
        <Box sx={{ flex: "1 1 calc(50% - 16px)" }}>
          <MetricCard
            title="Частота дыхания"
            data={breathingData}
            unit="дых/мин"
          />
        </Box>
        <Box sx={{ flex: "1 1 calc(50% - 16px)" }}>
          <MetricCard title="Время сна" data={sleepData} unit="часы" />
        </Box>
      </Box>
    </Container>
  );
};
