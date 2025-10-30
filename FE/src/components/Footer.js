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
            href="mailto:support@carsupper.com"
            className="text-white text-decoration-none"
          >
            support@carsupper.com
          </a>{" "}
          or call 0000000000 for any queries.
        </p>
        <p>
          For corporate queries, email{" "}
          <a
            href="mailto:business@carsupper.com"
            className="text-white text-decoration-none"
          >
            business@carsupper.com
          </a>
        </p>
        <p>21 Cai Khe Ward, Ninh Kieu District, Can Tho City</p>
        <p>CarSupper</p>

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
          © {new Date().getFullYear()}, CarSupper 
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
