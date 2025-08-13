// import React, { useState } from "react";
// import Card from "react-bootstrap/Card";
// import Col from "react-bootstrap/Col";
// import Row from "react-bootstrap/Row";
// import { Container, Form, Button } from "react-bootstrap";
// import { Bar } from "react-chartjs-2";

// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import axiosInstance from "../../axiosInstance";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// );

// const MonthlyReport = () => {
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [chartData, setChartData] = useState({
//     labels: [],
//     datasets: [
//       {
//         label: "Total Audio Files",
//         data: [],
//         backgroundColor: "#5568fe",
//         borderColor: "#5568fe",
//         borderWidth: 1,
//       },
//     ],
//   });

//   const options = {
//     indexAxis: "y",
//     responsive: true,
//     plugins: {
//       legend: {
//         labels: {
//           color: "white",
//         },
//         position: "top",
//       },
//       tooltip: {
//         enabled: true,
//         bodyColor: "white",
//       },
//     },
//     scales: {
//       x: {
//         beginAtZero: true,
//         ticks: {
//           color: "white",
//         },
//         grid: {
//           color: "#545454",
//         },
//       },
//       y: {
//         ticks: {
//           color: "white",
//         },
//         grid: {
//           color: "#545454",
//         },
//       },
//     },
//   };

//   const handleDateChange = (e) => {
//     const { name, value } = e.target;
//     if (name === "from") {
//       setStartDate(value);
//     } else {
//       setEndDate(value);
//     }
//   };

//   const handleRefresh = async () => {
//     if (!startDate || !endDate) {
//       alert("Please select both start and end dates.");
//       return;
//     }

//     try {
//       const response = await axiosInstance.get("/audio_count", {
//         params: {
//           start_date: startDate,
//           end_date: endDate,
//         },
//       });
//          console.log("response is ",response.data)
//       const data = response.data;
//       console.log("data", data);

//       const labels = data.map((item) => item.Period);
//       const audioData = data.map((item) => item.Total_Audio);


//       setChartData({
//         labels: labels,
//         datasets: [
//           {
//             label: "Total Audio Files",
//             data: audioData,
//             backgroundColor: "#5568fe",
//             borderColor: "#5568fe",
//             borderWidth: 1,
//           },
//         ],
//       });
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   return (
//     <Container fluid className="mt-3 mb-4 payment-section gx-0 mx-1">
//       <Form>
//         <Row className="justify-content-between align-items-center">
//           <Col sm={12} lg={3} className="">
//             <Form.Group>
//               <Form.Label className="me-2">From :</Form.Label>
//               <Form.Control
//                 type="date"
//                 name="from"
//                 value={startDate}
//                 onChange={handleDateChange}
//                 className="custom-date-input"
//               />
//             </Form.Group>
//           </Col>
//           <Col sm={12} lg={3}>
//             <Form.Group>
//               <Form.Label>To :</Form.Label>
//               <Form.Control
//                 type="date"
//                 name="to"
//                 value={endDate}
//                 onChange={handleDateChange}
//                 className="custom-date-input"

//               />
//             </Form.Group>
//           </Col>
//           <Col xs={6} sm={12} md={6} lg={2} className="my-2">
//             <Button variant="btn btn-primary inline" onClick={handleRefresh}>
//               Refresh
//             </Button>
//           </Col>
//         </Row>
//       </Form>

//       <Row className="g-2 mt-3">
//         <Col xs={12} sm={12} md={6}>
//           <Card>
//             <h4 className="text-center my-4">Total Sales</h4>
//             <Card.Body>
//               <Bar data={chartData} options={options} />
//             </Card.Body>
//           </Card>
//         </Col>

//         <Col xs={12} sm={12} md={6}>
//           <Card>
//             <h4 className="text-center my-4">Total Audio Files</h4>
//             <Card.Body>
//               <Bar data={chartData} options={options} />
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default MonthlyReport;






import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { Container, Form, Button } from "react-bootstrap";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axiosInstance from "../../axiosInstance";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MonthlyReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [audioChartData, setAudioChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Total Audio Files",
        data: [],
        backgroundColor: "#5568fe",
        borderColor: "#5568fe",
        borderWidth: 1,
      },
    ],
  });

  const [salesChartData, setSalesChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Total Sales",
        data: [],
        backgroundColor: "#28a745",
        borderColor: "#28a745",
        borderWidth: 1,
      },
    ],
  });

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "white",
        },
        position: "top",
      },
      tooltip: {
        enabled: true,
        bodyColor: "white",
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: "white",
        },
        grid: {
          color: "#545454",
        },
      },
      y: {
        ticks: {
          color: "white",
        },
        grid: {
          color: "#545454",
        },
      },
    },
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === "from") {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
  };

  const handleRefresh = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    try {
 
      const audioResponse = await axiosInstance.get("/audio_count", {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });

      const audioData = audioResponse.data;
      const audioLabels = audioData.map((item) => item.Period);
      const audioCount = audioData.map((item) => item.Total_Audio);

      setAudioChartData({
        labels: audioLabels,
        datasets: [
          {
            label: "Total Audio Files",
            data: audioCount,
            backgroundColor: "#5568fe",
            borderColor: "#5568fe",
            borderWidth: 1,
          },
        ],
      });


      const salesResponse = await axiosInstance.get("/audio_count", {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });

      const salesData = salesResponse.data;
      const salesLabels = salesData.map((item) => item.Period);
      const totalSales = salesData.map((item) => item.Total_Audio);

      setSalesChartData({
        labels: salesLabels,
        datasets: [
          {
            label: "Total Sales",
            data: totalSales,
            backgroundColor: "#28a745",
            borderColor: "#28a745",
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <Container fluid className="mt-3 mb-4 payment-section gx-0 mx-1">
      <Form>
        <Row className="justify-content-between align-items-center row-gap-3">
          <Col sm={12} lg={3} className="">
            <Form.Group>
              <Form.Label className="me-2">From :</Form.Label>
              <Form.Control
                type="date"
                name="from"
                value={startDate}
                onChange={handleDateChange}
                className="custom-date-input"
              />
            </Form.Group>
          </Col>
          <Col sm={12} lg={3}>
            <Form.Group>
              <Form.Label>To :</Form.Label>
              <Form.Control
                type="date"
                name="to"
                value={endDate}
                onChange={handleDateChange}
                className="custom-date-input"
              />
            </Form.Group>
          </Col>
          <Col xs={6} sm={12} md={6} lg={2} className="my-2">
            <Button variant="btn btn-primary inline" onClick={handleRefresh}>
              Refresh
            </Button>
          </Col>
        </Row>
      </Form>

      <Row className="g-2 mt-3">
        <Col xs={12} sm={12} md={6}>
          <Card>
            <h4 className="text-center my-4">Total Audio Files</h4>
            <Card.Body className="">
              <Bar data={audioChartData} options={options}  style={{height:"300px",width:"auto"}}/>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={12} md={6}>
          <Card>
            <h4 className="text-center my-4">Total Sales</h4>
            <Card.Body>
              <Bar data={salesChartData} options={options} style={{height:"300px",width:"auto"}}/>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MonthlyReport;
