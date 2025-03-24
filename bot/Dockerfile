FROM alpine:3.21.3

WORKDIR /usr/app

RUN apk add --update --no-cache firefox wget dbus ttf-freefont libstdc++ harfbuzz nss freetype nodejs npm

RUN wget https://github.com/mozilla/geckodriver/releases/download/v0.35.0/geckodriver-v0.35.0-linux64.tar.gz && \
    tar -xzf geckodriver-*.tar.gz && \
    mv geckodriver /usr/local/bin/ && \
    rm geckodriver-*.tar.gz

RUN addgroup -g 1001 botgroup && \
    adduser -u 1001 -G botgroup -h /usr/app -D bot

RUN chown -R bot:botgroup /usr/app && \
    chmod +x /usr/local/bin/geckodriver

COPY --chown=bot:botgroup package.json .

USER bot

RUN npm install

COPY --chown=bot:botgroup bot.js .

COPY resolv.conf /etc/resolv.conf

CMD ["node", "bot.js"]