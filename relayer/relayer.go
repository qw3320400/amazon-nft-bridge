package relayer

import (
	"context"
	"fmt"
	"log"
	"time"
)

type Relayer struct {
}

type RelayerOption func(*Relayer) error

func NewRelayer(ctx context.Context, opts ...RelayerOption) (*Relayer, error) {
	relayer := &Relayer{}
	for _, opt := range opts {
		err := opt(relayer)
		if err != nil {
			return nil, fmt.Errorf("relayer option run fail %s", err)
		}
	}
	return relayer, nil
}

func (r *Relayer) Run(ctx context.Context) {
	for {
		log.Default().Printf("relayer runing")
		time.Sleep(time.Second * 5)
	}
}
