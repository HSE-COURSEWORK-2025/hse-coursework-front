// … импорты оставляем без изменений
import { useState, useEffect } from "react";
import { Container, Typography, Box } from "@mui/material";
import { CustomChart } from "../../components/customChart/CustomChart";
import axios from "axios";
import { useSnackbar } from "notistack";
import React from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns"; // чтобы Chart.js понимал Date()

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
  Legend,
);

// Локальный тип для удобных вычислений внутри компонента:
interface MyDataPoint {
  x: Date;
  y: number;
}

// Тип для стейта: массивы MyDataPoint для каждой метрики
type ChartDataType = {
  pulse: MyDataPoint[];
  oxygen: MyDataPoint[];
  sleep: MyDataPoint[];
  activeMinutes: MyDataPoint[];
  distance: MyDataPoint[];
  steps: MyDataPoint[];
  totalCalories: MyDataPoint[];
  speed: MyDataPoint[];
};

type BackendDataElement = {
  X: string; // ISO-строка
  Y: number;
};

const API_URL = process.env.REACT_APP_DATA_COLLECTION_API_URL || "";

// Добавили новые метрики
const DATA_TYPES: Record<keyof ChartDataType, string> = {
  pulse: "HeartRateRecord",
  oxygen: "BloodOxygenData",
  sleep: "SleepSessionTimeData",
  activeMinutes: "ActiveMinutesRecord",
  distance: "DistanceRecord",
  steps: "StepsRecord",
  totalCalories: "TotalCaloriesBurnedRecord",
  speed: "SpeedRecord",
};

const transformData = (backendData: BackendDataElement[]): MyDataPoint[] =>
  backendData.map((item) => ({
    x: new Date(item.X),
    y: Number(item.Y),
  }));

interface RawDataChartsPageProps {
  onLoaded?: () => void;
}

export const RawDataChartsPage: React.FC<RawDataChartsPageProps> = ({
  onLoaded,
}) => {
  // Инициализируем стейты на основании ключей DATA_TYPES
  const [chartData, setChartData] = useState<ChartDataType>(
    Object.keys(DATA_TYPES).reduce(
      (acc, key) => ({ ...acc, [key]: [] }),
      {} as ChartDataType,
    ),
  );

  const [loadingMap, setLoadingMap] = useState<
    Record<keyof ChartDataType, boolean>
  >(
    Object.keys(DATA_TYPES).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof ChartDataType, boolean>,
    ),
  );

  const { enqueueSnackbar } = useSnackbar();
  const [forceLoading, setForceLoading] = useState(false);

  useEffect(() => {
    (Object.entries(DATA_TYPES) as [keyof ChartDataType, string][]).forEach(
      ([key, type]) => {
        // Для pulse и oxygen используем raw_data, остальные — processed_data
        const dataCategory =
          key === "pulse" || key === "oxygen" ? "raw_data" : "processed_data";

        axios
          .get<BackendDataElement[]>(
            `${API_URL}/api/v1/get_data/${dataCategory}/${type}`,
          )
          .then(({ data }) => {
            const transformed = transformData(data);
            setChartData((prev) => ({ ...prev, [key]: transformed }));
          })
          .catch(() => {
            enqueueSnackbar(`Ошибка загрузки данных для ${key}`, {
              variant: "error",
            });
          })
          .finally(() => {
            setLoadingMap((prev) => {
              const updated = { ...prev, [key]: false };
              if (Object.values(updated).every((v) => !v)) {
                onLoaded?.();
              }
              return updated;
            });
          });
      },
    );
  }, [enqueueSnackbar, onLoaded]);

  // Вычисление диапазона по оси X
  const getInitialRange = (data: MyDataPoint[]) => {
    if (data.length === 0) return { min: 0, max: 0 };
    const times = data.map((d) => d.x.getTime());
    return { min: Math.min(...times), max: Math.max(...times) };
  };

  const selectionColor = "#FF9800";

  const chartConfigs: Record<
    keyof ChartDataType,
    { title: string; unit: string; color: string }
  > = {
    pulse: { title: "Пульс", unit: "уд/мин", color: "#1565C0" },
    oxygen: { title: "Уровень кислорода", unit: "SpO2%", color: "#00897B" },
    sleep: { title: "Время сна", unit: "мин", color: "#00695C" },
    activeMinutes: {
      title: "Минуты активности",
      unit: "мин",
      color: "#FBC02D",
    },
    distance: { title: "Пройденная дистанция", unit: "км", color: "#388E3C" },
    steps: { title: "Количество шагов", unit: "шт", color: "#1976D2" },
    totalCalories: {
      title: "Всего сожжено калорий",
      unit: "ккал",
      color: "#D81B60",
    },
    speed: { title: "Средняя скорость", unit: "км/ч", color: "#5E35B1" },
  };

  // Локальный тип, соответствующий CustomChart
  type ChartDataPoint = { x: string; y: number };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        📈 Графики исходных данных
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {(Object.entries(DATA_TYPES) as [keyof ChartDataType, string][]).map(
          ([key]) => {
            const raw = chartData[key];
            const config = chartConfigs[key];
            const dataForChart: ChartDataPoint[] = raw.map((d) => ({
              x: d.x.toISOString(),
              y: d.y,
            }));

            return (
              <Box key={key} sx={{ width: "100%" }}>
                <CustomChart
                  title={config.title}
                  data={dataForChart}
                  unit={config.unit}
                  verticalLines={[]}
                  highlightIntervals={[]}
                  initialRange={getInitialRange(raw)}
                  lineColor={config.color}
                  selectionColor={selectionColor}
                  showStatus={false}
                  simulateLoading={forceLoading || loadingMap[key]}
                />
              </Box>
            );
          },
        )}
      </Box>
    </Container>
  );
};
