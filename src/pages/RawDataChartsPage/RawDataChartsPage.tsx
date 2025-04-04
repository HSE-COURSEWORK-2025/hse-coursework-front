import { useState, useEffect } from "react";
import { Container, Typography, Box } from "@mui/material";
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
  const [chartData, setChartData] = useState<ChartDataType>({
    pulse: [],
    oxygen: [],
    stress: [],
    breathing: [],
    sleep: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        
        const requests = Object.entries(DATA_TYPES).map(async ([key, type]) => {
          try {
            const response = await axios.get<BackendDataElement[]>(
              `${API_URL}/api/v1/getData/getRawData`,
              { params: { data_type: type } }
            );
            return { key, data: transformData(response.data) };
          } catch (error) {
            enqueueSnackbar(`Ошибка загрузки данных для ${key}`, { 
              variant: "error",
            });
            return { key, data: [] };
          }
        });

        const results = await Promise.all(requests);
        const newChartData = results.reduce((acc, { key, data }) => ({
          ...acc,
          [key]: data,
        }), {} as ChartDataType);

        setChartData(newChartData);
      } catch (error) {
        enqueueSnackbar("Общая ошибка загрузки данных", { 
          variant: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [enqueueSnackbar]);

  const getInitialRange = (data: DataPoint[]) => {
    if (data.length === 0) return { min: 0, max: 0 };
    const xValues = data.map(d => parseInt(d.x));
    return {
      min: Math.min(...xValues),
      max: Math.max(...xValues),
    };
  };

  const selectionColor = "#FF9800";

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h6">Загрузка данных...</Typography>
      </Container>
    );
  }

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
          const config = {
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
          }[chartKey];

          return (
            <Box key={key} sx={{ flex: "1 1 calc(50% - 16px)" }}>
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
              />
            </Box>
          );
        })}
      </Box>
    </Container>
  );
};