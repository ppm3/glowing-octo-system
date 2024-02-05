import axios from "axios";
import PhotoModal from "./PhotoModal";
import React, { useState, useEffect } from "react";
import { Table, Pagination, Form, Row, Col, Button } from "react-bootstrap";

const { REACT_APP_API_URL, REACT_APP_API_KEY } = process.env;

const PhotoTable = () => {
  const [photos, setPhotos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [photosPerPage] = useState(25);
  const [paginationInfo, setPaginationInfo] = useState({
    limit: 25,
    offset: 0,
    total: 0,
    pages: 0,
  });
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchValues, setSearchValues] = useState({
    title: "",
    albumTitle: "",
    userEmail: "",
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchValues]);

  const transformedSearchValues = {
    ...(searchValues.title && { title: searchValues.title }),
    ...(searchValues.albumTitle && { "album.title": searchValues.albumTitle }),
    ...(searchValues.userEmail && {
      "album.user.email": searchValues.userEmail,
    }),
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(REACT_APP_API_URL, {
        headers: { "x-api-key": REACT_APP_API_KEY },
        params: {
          offset: (currentPage - 1) * photosPerPage,
          limit: photosPerPage,
          ...transformedSearchValues,
        },
      });

      setPhotos(response.data);

      const limit = parseInt(response.headers["x-pagination-limit"], 0);
      const offset = parseInt(response.headers["x-pagination-offset"], 25);
      const total = parseInt(response.headers["x-pagination-total"], 0);
      const pages = parseInt(response.headers["x-pagination-pages"], 0);

      setPaginationInfo({ limit, offset, total, pages });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Get current photos
  const currentPhotos = photos;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleShowModal = (photo) => {
    setSelectedPhoto(photo);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Search photos
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchValues({
      ...searchValues,
      [name]: value,
    });
  };

  const handleClear = () => {
    setSearchValues({
      title: "",
      albumTitle: "",
      userEmail: "",
    });
  };

  // Render pagination items
  const renderPaginationItems = () => {
    const items = [];
    const { pages } = paginationInfo;

    // Display "First" button
    items.push(
      <Pagination.First
        key="first"
        onClick={() => paginate(1)}
        disabled={currentPage === 1}
      />,
    );

    // Display "Previous" button
    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
      />,
    );

    // Display up to 5 pages before current page
    for (let i = currentPage - 5; i < currentPage; i++) {
      if (i > 0) {
        items.push(
          <Pagination.Item key={i} onClick={() => paginate(i)}>
            {i}
          </Pagination.Item>,
        );
      }
    }

    // Display current page
    items.push(
      <Pagination.Item key={currentPage} active>
        {currentPage}
      </Pagination.Item>,
    );

    // Display up to 5 pages after current page
    for (let i = currentPage + 1; i <= currentPage + 5; i++) {
      if (i <= pages) {
        items.push(
          <Pagination.Item key={i} onClick={() => paginate(i)}>
            {i}
          </Pagination.Item>,
        );
      }
    }

    // Display "Next" button
    items.push(
      <Pagination.Next
        key="next"
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === pages}
      />,
    );

    // Display "Last" button
    items.push(
      <Pagination.Last
        key="last"
        onClick={() => paginate(pages)}
        disabled={currentPage === pages}
      />,
    );

    return items;
  };

  const showDetails = (photo) => {
    axios
      .get(`${REACT_APP_API_URL}/${photo.id}`, {
        headers: { "x-api-key": REACT_APP_API_KEY },
      })
      .then((response) => {
        handleShowModal(response.data);
      })
      .catch((error) => {
        console.error("Error fetching photo details:", error);
      });
  };

  return (
    <div id="tableContainer">
      <Form className="mb-3" id="searchFormContainer">
        <Row>
          <Col>
            <Form.Group controlId="formTitle">
              <Form.Label>Photo Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter photo title"
                name="title"
                value={searchValues.title}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formAlbumTitle">
              <Form.Label>Album Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter album title"
                name="albumTitle"
                value={searchValues.albumTitle}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formUserEmail">
              <Form.Label>User Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter user email"
                name="userEmail"
                value={searchValues.userEmail}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>
          <Col>
            <br />
            <Button variant="secondary" type="button" onClick={handleClear}>
              Clear
            </Button>
          </Col>
        </Row>
      </Form>
      <hr />
      <Table striped bordered hover className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Album Title</th>
            <th>User Name</th>
            <th>User Email</th>
            <th>Company Name</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {currentPhotos.length === 0 ? (
            <tr>
              <td colSpan="7" className="emptyResults">
                <h3>No Result!! :(</h3>
              </td>
            </tr>
          ) : (
            currentPhotos.map((photo) => (
              <tr key={photo.id}>
                <td>{photo.id}</td>
                <td>{photo.title}</td>
                <td>{photo.album.title}</td>
                <td>{photo.album.user.name}</td>
                <td>{photo.album.user.email}</td>
                <td>{photo.album.user.company.name}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => showDetails(photo)}
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      <Pagination className="pagination">{renderPaginationItems()}</Pagination>

      {/* Modal */}
      {selectedPhoto && (
        <PhotoModal
          show={showModal}
          onHide={handleCloseModal}
          photo={selectedPhoto}
        />
      )}
    </div>
  );
};

export default PhotoTable;
