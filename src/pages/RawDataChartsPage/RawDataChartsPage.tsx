import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { CustomChart } from "../../components/customChart/CustomChart";
import axios from "axios";
import { useSnackbar } from "notistack";

interface DataPoint {
  x: string;
  y: number;
}

type ChartDataType = {
  pulse: DataPoint[];
  oxygen: DataPoint[];
  stress: DataPoint[];
  breathing: DataPoint[];
  sleep: DataPoint[];
};

type BackendDataElement = {
  X: number;
  Y: number;
};

const API_URL = process.env.REACT_APP_API_URL || "";
const DATA_TYPES = {
  pulse: "PULSE",
  oxygen: "BLOOD_OXYGEN",
  stress: "STRESS_LVL",
  breathing: "RESPIRATORY_RATE",
  sleep: "SLEEP_TIME",
};

const transformData = (backendData: BackendDataElement[]): DataPoint[] => {
  return backendData.map((item) => ({
    x: String(item.X),
    y: Number(item.Y),
  }));
};

export const RawDataChartsPage: React.FC = () => {
  // Состояние для данных графиков
  const [chartData, setChartData] = useState<ChartDataType>({
    pulse: [],
    oxygen: [],
    stress: [],
    breathing: [],
    sleep: [],
  });
  // Отдельное состояние загрузки для каждого графика
  const [loadingMap, setLoadingMap] = useState<
    Record<keyof ChartDataType, boolean>
  >({
    pulse: true,
    oxygen: true,
    stress: true,
    breathing: true,
    sleep: true,
  });
  const { enqueueSnackbar } = useSnackbar();

  // Флаг для принудительного режима загрузки (для демонстрации)
  const [forceLoading, setForceLoading] = useState(false);

  useEffect(() => {
    Object.entries(DATA_TYPES).forEach(([key, type]) => {
      axios
        .get<BackendDataElement[]>(`${API_URL}/api/v1/getData/getRawData`, {
          params: { data_type: type },
        })
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
          setLoadingMap((prev) => ({ ...prev, [key]: false }));
        });
    });
  }, [enqueueSnackbar]);

  const getInitialRange = (data: DataPoint[]) => {
    if (data.length === 0) return { min: 0, max: 0 };
    const xValues = data.map((d) => parseInt(d.x));
    return {
      min: Math.min(...xValues),
      max: Math.max(...xValues),
    };
  };

  const selectionColor = "#FF9800";

  const chartConfigs = {
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
    stress: {
      title: "Оценка уровня стресса",
      unit: "баллы",
      color: "#512DA8",
    },
    breathing: {
      title: "Частота дыхания",
      unit: "дых/мин",
      color: "#424242",
    },
    sleep: {
      title: "Время сна",
      unit: "часы",
      color: "#00695C",
    },
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Жизненные показатели
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Исходные данные жизненных показателей
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {Object.entries(chartData).map(([key, data]) => {
          const chartKey = key as keyof ChartDataType;
          const config = chartConfigs[chartKey];

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
                data={data}
                unit={config.unit}
                verticalLines={[]}
                highlightIntervals={[]}
                initialRange={getInitialRange(data)}
                lineColor={config.color}
                selectionColor={selectionColor}
                showStatus={false}
                // Если принудительный режим загрузки включён или данные ещё грузятся – показываем анимацию
                simulateLoading={forceLoading || loadingMap[chartKey]}
              />
            </Box>
          );
        })}
      </Box>
    </Container>
  );
};
