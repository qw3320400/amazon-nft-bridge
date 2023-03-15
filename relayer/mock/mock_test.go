package mock

import (
	"net/http"
	"testing"
)

func TestDefault(t *testing.T) {
	req, err := http.NewRequest("POST", "http://127.0.0.1:8000/", nil)
	if err != nil {
		t.Fatal(err)
	}
	http.DefaultClient.Do(req)
}
