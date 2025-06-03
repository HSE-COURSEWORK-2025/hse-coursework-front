// … импорты оставляем без изменений
import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { CustomChart } from "../../components/customChart/CustomChart";
import axios from "axios";
import { useSnackbar } from "notistack";

type Props = {
  onLoaded?: () => void;
};

interface DataPoint {
  // теперь x как ISO-строка, y как число
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

type BackendData = {
  data: Array<{ X: string; Y: number }>; // X приходит как ISO
  outliersX: string[];                     // тоже ISO-строки
};

const API_URL = process.env.REACT_APP_DATA_COLLECTION_API_URL || "";
const DATA_TYPES = {
  pulse: "HeartRateRecord",
  oxygen: "BloodOxygenData",
  // stress: "STRESS_LVL",
  // breathing: "RESPIRATORY_RATE",
  sleep: "SleepSessionTimeData",
};

// 1) Исправляем transformData:
//    Теперь просто передаём X как есть (ISO-строку). А для outliers сразу конвертим в таймстемпы.
const transformData = (backendData: BackendData) => ({
  data: backendData.data.map((item) => ({
    x: item.X,        // ISO-строка, например "2025-05-27T03:33:00Z"
    y: Number(item.Y),
  })),
  // Конвертируем каждый ISO-строку в миллисекунды:
  outliers: backendData.outliersX.map((iso) =>
    new Date(iso).getTime().toString()
  ),
});

export const DataWOutliersChartsPage: React.FC<Props> = ({ onLoaded }) => {
  const [chartData, setChartData] = useState<ChartDataType>({
    pulse: [],
    oxygen: [],
    stress: [],
    breathing: [],
    sleep: [],
  });

  const [outliers, setOutliers] = useState<
    Record<keyof ChartDataType, string[]>
  >({
    pulse: [],
    oxygen: [],
    stress: [],
    breathing: [],
    sleep: [],
  });

  // Состояния загрузки
  const [loadingMap, setLoadingMap] = useState<
    Record<keyof ChartDataType, boolean>
  >({
    pulse: true,
    oxygen: true,
    stress: true,
    breathing: true,
    sleep: true,
  });

  const [forceLoading, setForceLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchAllData = async () => {
      const requests = Object.entries(DATA_TYPES).map(
        async ([key, type]) => {
          try {
            const response = await axios.get<BackendData>(
              `${API_URL}/api/v1/get_data/data_with_outliers/${type}`,
              { params: { data_type: type } }
            );
            const { data, outliers } = transformData(response.data);
            return { key, data, outliers };
          } catch (error) {
            enqueueSnackbar(`Ошибка загрузки данных для ${key}`, {
              variant: "error",
            });
            return { key, data: [], outliers: [] };
          }
        }
      );

      const results = await Promise.all(requests);

      const newChartData = results.reduce(
        (acc, { key, data }) => ({
          ...acc,
          [key]: data,
        }),
        {} as ChartDataType
      );

      const newOutliers = results.reduce(
        (acc, { key, outliers }) => ({
          ...acc,
          [key]: outliers,
        }),
        {} as Record<keyof ChartDataType, string[]>
      );

      setChartData(newChartData);
      setOutliers(newOutliers);

      // Отключаем флаги загрузки
      setLoadingMap({
        pulse: false,
        oxygen: false,
        stress: false,
        breathing: false,
        sleep: false,
      });
    };

    fetchAllData();
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (Object.values(loadingMap).every((v) => v === false)) {
      onLoaded?.();
    }
  }, [loadingMap, onLoaded]);

  // 2) Исправляем getInitialRange:
  //    Парсим x из ISO в миллисекунды, чтобы найти min/max
  const getInitialRange = (data: DataPoint[]) => {
    if (data.length === 0) return { min: 0, max: 0 };
    // Преобразуем x: string (ISO) → Date → .getTime()
    const xValues = data.map((d) => new Date(d.x).getTime());
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
        🚨 Графики с выбросами
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {Object.entries(chartData).map(([key, data]) => {
          const chartKey = key as keyof ChartDataType;
          const config = chartConfigs[chartKey];

          return (
            <Box key={key} sx={{ flex: "1 1 calc(50% - 16px)" }}>
              <CustomChart
                title={config.title}
                data={data}
                unit={config.unit}
                // verticalLines теперь — массив строк с millisecond timestamp,
                // внутри CustomChart будет вызов Number(line) → число
                verticalLines={outliers[chartKey]}
                highlightIntervals={[]}
                initialRange={getInitialRange(data)}
                lineColor={config.color}
                selectionColor={selectionColor}
                showStatus={true}
                simulateLoading={forceLoading || loadingMap[chartKey]}
              />
            </Box>
          );
        })}
      </Box>
    </Container>
  );
};
