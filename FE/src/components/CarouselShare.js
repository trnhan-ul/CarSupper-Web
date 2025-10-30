import React from "react";
import { Carousel } from "react-bootstrap";

const CarouselShare = ({ carousels }) => {
  return (
    <Carousel className="mt-2">
      {carousels.map((item) => (
        <Carousel.Item key={item.id}>
          <img
            className="d-block w-100"
            src={item.url}
            style={{ height: 600 }}
            alt={item.id}
          />
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default CarouselShare;
