import { Link, useNavigate, Outlet, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import { useState } from "react";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isPending, error, isError } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });

  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  const handleStartDelete = () => {
    setIsDeleting(true);
  };
  const handleStopDelete = () => {
    setIsDeleting(false);
  };

  const handleDelete = () => {
    mutate({ id: id });
  };

  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isPending && (
        <div className="center">
          <LoadingIndicator />
        </div>
      )}

      {isError && (
        <ErrorBlock
          title="Failed to find event"
          message={error.info?.message || "Failed to find event"}
        />
      )}

      {data && (
        <>
          {isDeleting && (
            <Modal onClose={handleStopDelete}>
              <h2>Are you sure?</h2>
              <p>
                Do you really want to delete this event? This action cannot be
                undone.
              </p>
              <div className="form-actions">
                {isPendingDeletion && <p>Deleting, please wait....</p>}
                {!isPendingDeletion && (
                  <>
                    <button onClick={handleStopDelete} className="button-text">
                      Cancel
                    </button>
                    <button onClick={handleDelete} className="button">
                      Delete
                    </button>
                  </>
                )}
              </div>
              {isErrorDeleting && (
                <ErrorBlock
                  title="Failed to delete event"
                  message={
                    deleteError.info?.message || "Failed to delete event"
                  }
                />
              )}
            </Modal>
          )}
          <article id="event-details">
            <header>
              <h1>{data.title}</h1>
              <nav>
                <button onClick={handleStartDelete}>Delete</button>
                <Link to="edit">Edit</Link>
              </nav>
            </header>
            <div id="event-details-content">
              <img
                src={`http://localhost:3000/${data.image}`}
                alt={data.title}
              />
              <div id="event-details-info">
                <div>
                  <p id="event-details-location">{data.location}</p>
                  <time dateTime={`Todo-DateT$Todo-Time`}>{data.date}</time>
                </div>
                <p id="event-details-description">{data.description}</p>
              </div>
            </div>
          </article>
        </>
      )}
    </>
  );
}
