# Use Debian as base
FROM debian:latest

# Set non-root user for security
RUN useradd -ms /bin/bash printer

# Install required packages
RUN apt update && apt install -y \
    prusa-slicer \
    python3 \
    python3-pip \
    python3-venv \
    redis-tools \
    && rm -rf /var/lib/apt/lists/*

# Create and activate virtual environment
RUN mkdir -p /app
WORKDIR /app
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

# Install Python dependencies
COPY requirements.txt /app/requirements.txt
RUN /app/venv/bin/pip install --upgrade pip && \
    /app/venv/bin/pip install -r /app/requirements.txt

# Copy server and slicing script
COPY server.py /app/server.py
COPY slice_model.py /app/slice_model.py

# Expose API port
EXPOSE 5000

# Start Flask server
CMD ["/app/venv/bin/python3", "/app/server.py"]
