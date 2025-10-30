import React from "react";
import { Container } from "react-bootstrap";
import { FaFacebookF, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-4 pb-2 text-center">
      <Container>
        <p>
          Contact us at{" "}
          <a
            href="mailto:support@carsuper.com"
            className="text-white text-decoration-none"
          >
            support@carsuper.com
          </a>{" "}
          or call 0396686970 for any queries.
        </p>
        <p>
          For corporate queries, email{" "}
          <a
            href="mailto:business@carsuper.com"
            className="text-white text-decoration-none"
          >
            business@carsuper.com
          </a>
        </p>
        <p>600 An Binh Ward, Ninh Kieu District, Can Tho City</p>
        <p>Car Super Store - Elevate Your Car</p>

        <div className="mt-3">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white mx-2"
          >
            <FaFacebookF size={20} />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white mx-2"
          >
            <FaInstagram size={20} />
          </a>
        </div>

        <p className="mt-3">
          © {new Date().getFullYear()}, Car Super Store - Powered by Shopify
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
