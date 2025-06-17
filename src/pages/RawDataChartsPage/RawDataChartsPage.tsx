import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
} from "@mui/material";
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
  Legend
);

// Локальный тип для удобных вычислений внутри компонента:
interface MyDataPoint {
  x: Date;
  y: number;
}

// Тип для стейта: у нас три массива MyDataPoint
type ChartDataType = {
  pulse: MyDataPoint[];
  oxygen: MyDataPoint[];
  sleep: MyDataPoint[];
};

type BackendDataElement = {
  X: string; // ISO-строка
  Y: number;
};

const API_URL = process.env.REACT_APP_DATA_COLLECTION_API_URL || "";
const DATA_TYPES = {
  pulse: "HeartRateRecord",
  oxygen: "BloodOxygenData",
  sleep: "SleepSessionTimeData",
};

// Преобразуем ответ бэкенда ({ X: string; Y: number }) → MyDataPoint ({ x: Date; y: number })
const transformData = (backendData: BackendDataElement[]): MyDataPoint[] => {
  return backendData.map((item) => ({
    x: new Date(item.X),
    y: Number(item.Y),
  }));
};

interface RawDataChartsPageProps {
  onLoaded?: () => void;
}

export const RawDataChartsPage: React.FC<RawDataChartsPageProps> = ({
  onLoaded,
}) => {
  const [chartData, setChartData] = useState<ChartDataType>({
    pulse: [],
    oxygen: [],
    sleep: []
  });

  const [loadingMap, setLoadingMap] = useState<Record<keyof ChartDataType, boolean>>({
    pulse: true,
    oxygen: true,
    sleep: true
  });

  const { enqueueSnackbar } = useSnackbar();
  const [forceLoading, setForceLoading] = useState(false);

  useEffect(() => {
    Object.entries(DATA_TYPES).forEach(([key, type]) => {
      // используем разные эндпоинты для сырых и обработанных данных
      const dataCategory = key === 'sleep' ? 'processed_data' : 'raw_data';
      axios
        .get<BackendDataElement[]>(
          `${API_URL}/api/v1/get_data/${dataCategory}/${type}`
        )
        .then((response) => {
          const data = transformData(response.data);
          setChartData((prev) => ({ ...prev, [key]: data }));
        })
        .catch(() => {
          enqueueSnackbar(`Ошибка загрузки данных для ${key}`, {
            variant: "error",
          });
        })
        .finally(() => {
          setLoadingMap((prev) => {
            const updated = { ...prev, [key]: false };
            if (Object.values(updated).every((v) => v === false)) {
              onLoaded?.();
            }
            return updated;
          });
        });
    });
  }, [enqueueSnackbar, onLoaded]);

  // Для вычисления начального диапазона (в миллисекундах)
  const getInitialRange = (data: MyDataPoint[]) => {
    if (data.length === 0) return { min: 0, max: 0 };
    const xValues = data.map((d) => d.x.getTime());
    return {
      min: Math.min(...xValues),
      max: Math.max(...xValues),
    };
  };

  const selectionColor = "#FF9800";

  const chartConfigs: Record<keyof ChartDataType, { title: string; unit: string; color: string }> = {
    pulse: {
      title: "Пульс",
      unit: "уд/мин",
      color: "#1565C0",
    },
    oxygen: {
      title: "Уровень кислорода в крови",
      unit: "SpO2%",
      color: "#00897B",
    },
    sleep: {
      title: "Время сна",
      unit: "часы",
      color: "#00695C",
    },
  };

  // Локальный тип, совпадающий с тем, что ждет CustomChart
  type ChartDataPoint = { x: string; y: number };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        📈 Графики исходных данных
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {Object.entries(DATA_TYPES).map(([key]) => {
          const chartKey = key as keyof ChartDataType;
          const config = chartConfigs[chartKey];
          const rawData: MyDataPoint[] = chartData[chartKey];

          // Конвертируем из MyDataPoint (Date) → ChartDataPoint (ISO-строка)
          const dataForChart: ChartDataPoint[] = rawData.map((dp) => ({
            x: dp.x.toISOString(),
            y: dp.y,
          }));

          return (
            <Box
              key={key}
              sx={{
                flex: "1 1 calc(50% - 16px)",
                minHeight: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CustomChart
                title={config.title}
                data={dataForChart}                   
                unit={config.unit}
                verticalLines={[]}
                highlightIntervals={[]}
                initialRange={getInitialRange(rawData)}
                lineColor={config.color}
                selectionColor={selectionColor}
                showStatus={false}
                simulateLoading={forceLoading || loadingMap[chartKey]}
              />
            </Box>
          );
        })}
      </Box>
    </Container>
  );
};
