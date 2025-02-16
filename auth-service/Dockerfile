FROM cgr.dev/chainguard/python:latest-dev

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Define environment variable
ENV FLASK_HOST=0.0.0.0
ENV FLASK_PORT=5000

ENTRYPOINT ["python3"]
CMD ["app.py"]