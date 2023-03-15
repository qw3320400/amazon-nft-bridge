package mock

import (
	"context"
	"log"
	"net/http"
)

type Mock struct {
}

func NewMock(ctx context.Context) (*Mock, error) {
	mock := &Mock{}
	return mock, nil
}

func (r *Mock) Run(ctx context.Context) {
	log.Default().Printf("running mock http server")
	http.HandleFunc("/", defaultHandler)
	http.ListenAndServe(":8000", nil)
}

func defaultHandler(w http.ResponseWriter, r *http.Request) {
	log.Default().Printf("mock default handler")
}
