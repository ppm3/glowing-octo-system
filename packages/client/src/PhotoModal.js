// PhotoModal.js
import React from "react";
import { Modal, Button } from "react-bootstrap";

const PhotoModal = ({ show, onHide, photo }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Photo Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <img
          src={photo.thumbnailUrl}
          alt={photo.title}
          style={{ maxWidth: "100%" }}
        />
        <h4>{photo.title}</h4>
        <p>
          <span>ID:</span> {photo.id}
        </p>
        <p>
          <span>Album Title:</span> {photo.album.title}
        </p>
        <p>
          <span>User Name:</span> {photo.album.user.name}
        </p>
        <p>
          <span>Image URL:</span> {photo.url}
        </p>
        <p>
          <span>Image thumbnail URL:</span> {photo.thumbnailUrl}
        </p>
        <hr />
        <h5>User Details:</h5>
        <p>
          <span>Email:</span> {photo.album.user.email}
        </p>
        <p>
          <span>Phone:</span> {photo.album.user.phone}
        </p>
        <p>
          <span>Website:</span> {photo.album.user.website}
        </p>
        <hr />
        <h5>Address:</h5>
        <p>
          <span>Street:</span> {photo.album.user.address.street}
        </p>
        <p>
          <span>Suite:</span> {photo.album.user.address.suite}
        </p>
        <p>
          <span>City:</span> {photo.album.user.address.city}
        </p>
        <p>
          <span>Zipcode:</span> {photo.album.user.address.zipcode}
        </p>
        <hr />
        <h5>Geo Location:</h5>
        <p>
          <span>Latitude:</span> {photo.album.user.address.geo.lat}
        </p>
        <p>
          <span>Longitude:</span> {photo.album.user.address.geo.lng}
        </p>
        <hr />
        <h5>Company:</h5>
        <p>
          <span>Company Name:</span> {photo.album.user.company.name}
        </p>
        <p>
          <span>Catch Phrase:</span> {photo.album.user.company.catchPhrase}
        </p>
        <p>
          <span>BS:</span> {photo.album.user.company.bs}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PhotoModal;
