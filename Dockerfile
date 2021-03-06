FROM node:12.10-alpine as FRONTEND

RUN apk add --update \
    && apk add --no-cache build-base curl-dev linux-headers bash git\
    && rm -rf /var/cache/apk/*

COPY swift_browser_ui_frontend /root/swift_ui/swift_browser_ui_frontend

RUN cd /root/swift_ui/swift_browser_ui_frontend \
    && git clone --verbose https://github.com/CSCfi/swift-x-account-sharing.git \
    && cp swift-x-account-sharing/bindings/js/swift_x_account_sharing_bind.js src/common/swift_x_account_sharing_bind.js \
    && rm -rf swift-x-account-sharing \
    && git clone --verbose https://github.com/CSCfi/swift-sharing-request.git \
    && cp swift-sharing-request/bindings/js/swift_sharing_request_bind.js src/common/swift_sharing_request_bind.js \
    && rm -rf swift-sharing-request \
    && npm install \
    && npm run build

FROM python:3.7-alpine3.9 as BACKEND

RUN apk add --update \
    && apk add --no-cache build-base curl-dev linux-headers bash git\
    && apk add --no-cache libressl-dev libffi-dev\
    && rm -rf /var/cache/apk/*

COPY requirements.txt /root/swift_ui/requirements.txt
COPY setup.py /root/swift_ui/setup.py
COPY swift_browser_ui /root/swift_ui/swift_browser_ui
COPY --from=FRONTEND /root/swift_ui/swift_browser_ui_frontend/dist /root/swift_ui/swift_browser_ui_frontend/dist

RUN pip install --upgrade pip && \
    pip install -r /root/swift_ui/requirements.txt && \
    pip install /root/swift_ui

FROM python:3.7-alpine3.9

RUN apk add --no-cache --update bash

LABEL maintainer "CSC Developers"
LABEL org.label-schema.schema-version="1.0"
LABEL org.label-schema.vcs-url="https://github.com/CSCFI/swift-browser-ui"

COPY --from=BACKEND usr/local/lib/python3.7/ usr/local/lib/python3.7/

COPY --from=BACKEND /usr/local/bin/gunicorn /usr/local/bin/

COPY --from=BACKEND /usr/local/bin/swift-browser-ui /usr/local/bin/

RUN mkdir -p /app

WORKDIR /app

COPY ./deploy/app.sh /app/app.sh

RUN chmod +x /app/app.sh

RUN adduser --disabled-password --no-create-home swiftui
USER swiftui

ENTRYPOINT ["/bin/sh", "-c", "/app/app.sh"]
