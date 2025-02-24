FROM public.ecr.aws/docker/library/golang:1.21rc2-alpine3.17 as build

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o myapp .

FROM alpine:latest

WORKDIR /app

COPY --from=build /app/myapp .

EXPOSE 4000

CMD [ "./myapp" ]