import React from 'react';

const SearchboxModal = () => {
  return (
    <div
      className="modal fade"
      id="searchBoxModal"
      tabIndex="-1"
      aria-labelledby="searchBoxModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg modal-fullscreen-md-down">
        <div className="modal-content">
          <div className="modal-header border-0">
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <form>
              <input
                className="form-control form-control-lg"
                type="search"
                placeholder="검색..."
                aria-label="Search"
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchboxModal;

