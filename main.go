package main

import (
	"amazon-nft-bridge/relayer"
	"amazon-nft-bridge/relayer/mock"
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	ctx := context.Background()

	// new relayer
	relayerInstance, err := relayer.NewRelayer(ctx)
	if err != nil {
		log.Fatalf("NewRelayer fail %s", err)
	}
	go handlePanic(func() {
		relayerInstance.Run(ctx)
	})

	// new mock for test
	mockInstance, err := mock.NewMock(ctx)
	if err != nil {
		log.Fatalf("NewRelayer fail %s", err)
	}
	go handlePanic(func() {
		mockInstance.Run(ctx)
	})

	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	s := <-sigs
	log.Default().Printf("signal %s", s)
}

func handlePanic(f func()) {
	defer func() {
		if err := recover(); err != nil {
			log.Println("panic occurred:", err)
		}
	}()
	f()
}
