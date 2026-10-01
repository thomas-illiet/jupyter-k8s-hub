ARG PROFILE=python
FROM quay.io/jupyter/base-notebook:python-3.12 AS python

USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
      curl git openssh-client ca-certificates \
    && curl -fsSL https://code-server.dev/install.sh | sh \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
USER ${NB_UID}
RUN python -m pip install --no-cache-dir \
      jupyter-server-proxy==4.4.0 \
      jupyter-vscode-proxy==0.6

FROM python AS datascience
USER ${NB_UID}
RUN python -m pip install --no-cache-dir \
      numpy pandas scipy scikit-learn matplotlib seaborn plotly \
      sqlalchemy openpyxl pyarrow ipykernel

FROM python AS node
USER root
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && npm install --global pnpm typescript \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
USER ${NB_UID}

FROM python AS java
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
      openjdk-21-jdk-headless maven \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
USER ${NB_UID}

FROM nvidia/cuda:12.8.1-cudnn-runtime-ubuntu24.04 AS cuda-runtime
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 python3-pip python3-venv curl git openssh-client ca-certificates tini \
    && curl -fsSL https://code-server.dev/install.sh | sh \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --uid 1000 --shell /bin/bash jovyan
RUN python3 -m pip install --break-system-packages --no-cache-dir \
      jupyterhub==5.3.0 jupyterlab==4.4.7 jupyter-server-proxy==4.4.0 \
      jupyter-vscode-proxy==0.6 torch torchvision torchaudio
ENV HOME=/home/jovyan
WORKDIR /home/jovyan/work
RUN chown -R 1000:1000 /home/jovyan
USER 1000
ENTRYPOINT ["tini", "-g", "--"]
CMD ["jupyterhub-singleuser"]

FROM ${PROFILE} AS final
ENV JUPYTERHUB_SINGLEUSER_APP=notebook.notebookapp.NotebookApp

