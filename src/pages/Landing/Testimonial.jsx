import React, { useRef } from "react";
import "swiper/css";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import "./styles/testimonial.css";

const testimonials = [
  {
    id: 1,
    name: "John Doe",
    title: "Student",
    text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making",
    image: "https://decorai.ai/images/about.png",
    rating: 5,
  },
  {
    id: 2,
    name: "Jane Smith",
    title: "Content writer",
    text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making",
    image: "https://decorai.ai/images/about.png",
    rating: 4,
  },
  {
    id: 3,
    name: "Mike Johnson",
    title: "SEO",
    text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making",
    image: "https://decorai.ai/images/about.png",
    rating: 5,
  },
  {
    id: 4,
    name: "Anna White",
    title: "Content writer",
    text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making",
    image: "https://decorai.ai/images/about.png",
    rating: 4,
  },
];

const renderStars = (rating) => {
  return Array.from({ length: 5 }).map((_, index) => (
    <img
      key={index}
      src={index < rating ? "/svg/Filled-star.svg" : "/svg/Empty-star.svg"}
      alt={index < rating ? "Filled Star" : "Empty Star"}
      className="star-icon"
    />
  ));
};

const Testimonial = () => {
  const sliderRef = useRef(null);

  return (
    <Container className="testimonial-section">
      <Row className="justify-content-center mb-4">
        <Col xs={12} md={8} className="text-center">
          <h2 className="section-title">What Our Clients Say</h2>
          <p>
            See how our solutions have made a difference for businesses just
            like yours.
          </p>
        </Col>
      </Row>
      <Row>
        <Swiper
          ref={sliderRef}
          spaceBetween={30}
          slidesPerView={1}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          loop={true}
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id}>
              <Card className="testimonial-card">
                <Card.Img
                  variant="top"
                  src={testimonial.image}
                  alt={`${testimonial.name}'s image`}
                  className="testimonial-image"
                />
                <Card.Body>
                  <div className="testimonial-text">{testimonial.text}</div>
                  <div className="rating-stars">
                    {renderStars(testimonial.rating)}
                  </div>
                  <Card.Title className="testimonial-name">
                    {testimonial.name}
                  </Card.Title>
                  <Card.Subtitle className="testimonial-title">
                    {testimonial.title}
                  </Card.Subtitle>
                </Card.Body>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </Row>
    </Container>
  );
};

export default Testimonial;
