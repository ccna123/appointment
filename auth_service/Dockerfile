FROM public.ecr.aws/docker/library/golang:1.21rc2-alpine3.17 as build

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o myapp .

FROM alpine:latest

WORKDIR /app

COPY --from=build /app/myapp .

# It’s a form of metadata or documentation, indicating the port your application uses.
# This is a hint to the person running the container that they need to expose this port.
EXPOSE 4020 

CMD [ "./myapp" ]