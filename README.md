# Leaky Flagment - Intigriti 0325 CTF-challenge

This repository holds the code for Intigriti's 0325 Capture The Flag challenge.


# Requirements

- [Docker](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/)


# Setup

1. Clone the repository: `git clone https://github.com/0x999-x/Intigriti-0325-CTF-challenge.git`
2. Navigate to the challenge directory: `cd Intigriti-0325-CTF-challenge`
3. Start the application using Docker Compose: `docker compose up`
4. Access the challenge at `http://localhost/`


>**Note:** The Firefox bot will not work when running on `localhost`. To resolve this, you can modify the `DOMAIN` and `BASE_URL` values in the `docker-compose.yml` file to use the docker host's gateway IP (typically `172.17.0.1` or `172.18.0.1`). Alternatively, you can expose your `http://localhost` to an externally accessible URL (e.g., via a tunneling service such as ngrok) and use that.
