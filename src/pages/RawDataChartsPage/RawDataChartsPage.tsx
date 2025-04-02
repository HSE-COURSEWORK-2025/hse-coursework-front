import { useState, useEffect } from "react";
import { Container, Typography, Box } from "@mui/material";
import { CustomChart } from "../../components/customChart/CustomChart";

interface DataPoint {
  year: string;
  value: number;
}

const generateRandomData = (
  startYear: number,
  endYear: number,
  minValue: number,
  maxValue: number,
  precision: number = 0
): DataPoint[] => {
  return Array.from({ length: endYear - startYear + 1 }, (_, i) => ({
    year: String(startYear + i),
    value: Number(
      (Math.random() * (maxValue - minValue) + minValue).toFixed(precision)
    ),
  }));
};

export const RawDataChartsPage = () => {
  const [chartData, setChartData] = useState<{
    pulse: Array<{ year: string; value: number }>;
    oxygen: Array<{ year: string; value: number }>;
    stress: Array<{ year: string; value: number }>;
    breathing: Array<{ year: string; value: number }>;
    sleep: Array<{ year: string; value: number }>;
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

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Жизненные показатели
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Анализ выбросов жизненных показателей
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ flex: "1 1 calc(50% - 16px)" }}>
          <CustomChart
            title="Пульс"
            data={chartData.pulse}
            unit="уд/мин"
            verticalLines={["2015", "2016"]}
            highlightIntervals={[
              { start: "2013", end: "2014" },
              { start: "2015", end: "2016" },
            ]}
          />
        </Box>
        <Box sx={{ flex: "1 1 calc(50% - 16px)" }}>
          <CustomChart
            title="Уровень кислорода в крови"
            data={chartData.oxygen}
            unit="SpO2%"
          />
        </Box>
        <Box sx={{ flex: "1 1 calc(50% - 16px)" }}>
          <CustomChart
            title="Оценка уровня стресса"
            data={chartData.stress}
            unit="баллы"
          />
        </Box>
        <Box sx={{ flex: "1 1 calc(50% - 16px)" }}>
          <CustomChart
            title="Частота дыхания"
            data={chartData.breathing}
            unit="дых/мин"
          />
        </Box>
        <Box sx={{ flex: "1 1 calc(50% - 16px)" }}>
          <CustomChart title="Время сна" data={chartData.sleep} unit="часы" />
        </Box>
      </Box>
    </Container>
  );
};
