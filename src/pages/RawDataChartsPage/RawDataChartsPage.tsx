import { useState, useEffect } from "react";
import { Container, Typography, Box } from "@mui/material";
import { CustomChart } from "../../components/customChart/CustomChart";

interface DataPoint {
  x: string;
  y: number;
}

const generateRandomData = (
  startX: number,
  endX: number,
  minValue: number,
  maxValue: number,
  precision: number = 0
): DataPoint[] => {
  return Array.from({ length: endX - startX + 1 }, (_, i) => ({
    x: String(startX + i),
    y: Number(
      (Math.random() * (maxValue - minValue) + minValue).toFixed(precision)
    ),
  }));
};

export const RawDataChartsPage = () => {
  const [chartData, setChartData] = useState<{
    pulse: DataPoint[];
    oxygen: DataPoint[];
    stress: DataPoint[];
    breathing: DataPoint[];
    sleep: DataPoint[];
  }>({
    pulse: [],
    oxygen: [],
    stress: [],
    breathing: [],
    sleep: [],
  });

  useEffect(() => {
    setChartData({
      pulse: generateRandomData(1000, 2000, 60, 100, 0),
      oxygen: generateRandomData(1000, 2000, 95, 100, 0),
      stress: generateRandomData(1000, 2000, 2, 4, 1),
      breathing: generateRandomData(1000, 2000, 12, 20, 0),
      sleep: generateRandomData(1000, 2000, 4, 9, 1),
    });
  }, []);

  // Один и тот же цвет выделения для всех графиков (жёлтый/оранжевый фон для выделения)
  const selectionColor = "#FF9800"; 

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Жизненные показатели
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Анализ выбросов жизненных показателей
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {/* Пульс */}
        <Box sx={{ flex: "1 1 calc(50% - 16px)" }}>
          <CustomChart
            title="Пульс"
            data={chartData.pulse}
            unit="уд/мин"
            verticalLines={["1980", "2016"]}
            highlightIntervals={[
              { start: 1990, end: 1995 },
              { start: 1050, end: 1080 },
            ]}
            initialRange={{ min: 1950, max: 2000 }}
            lineColor="#1565C0" // Глубокий синий
            selectionColor={selectionColor}
          />
        </Box>
        {/* Уровень кислорода */}
        <Box sx={{ flex: "1 1 calc(50% - 16px)" }}>
          <CustomChart
            title="Уровень кислорода в крови"
            data={chartData.oxygen}
            unit="SpO2%"
            initialRange={{ min: 1950, max: 2000 }}
            verticalLines={[]}
            highlightIntervals={[]}
            lineColor="#00897B" // Яркий, насыщенный бирюзовый (teal)
            selectionColor={selectionColor}
          />
        </Box>
        {/* Стресс */}
        <Box sx={{ flex: "1 1 calc(50% - 16px)" }}>
          <CustomChart
            title="Оценка уровня стресса"
            data={chartData.stress}
            unit="баллы"
            initialRange={{ min: 1950, max: 2000 }}
            verticalLines={["123"]}
            highlightIntervals={[]}
            lineColor="#512DA8" // Глубокий фиолетовый
            selectionColor={selectionColor}
          />
        </Box>
        {/* Частота дыхания */}
        <Box sx={{ flex: "1 1 calc(50% - 16px)" }}>
          <CustomChart
            title="Частота дыхания"
            data={chartData.breathing}
            unit="дых/мин"
            initialRange={{ min: 1950, max: 2000 }}
            verticalLines={[]}
            highlightIntervals={[]}
            lineColor="#424242" // Тёмно-серый, контрастный с тёплыми оттенками
            selectionColor={selectionColor}
          />
        </Box>
        {/* Время сна */}
        <Box sx={{ flex: "1 1 calc(50% - 16px)" }}>
          <CustomChart
            title="Время сна"
            data={chartData.sleep}
            unit="часы"
            initialRange={{ min: 1950, max: 2000 }}
            verticalLines={[]}
            highlightIntervals={[]}
            lineColor="#00695C" // Тёмный бирюзовый/изумрудный
            selectionColor={selectionColor}
          />
        </Box>
      </Box>
    </Container>
  );
};
