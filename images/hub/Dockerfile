FROM quay.io/jupyterhub/k8s-hub:4.2.0

USER root
COPY images/hub/requirements.txt /tmp/requirements.txt
RUN python3 -m pip install --no-cache-dir -r /tmp/requirements.txt

COPY theme/templates /usr/local/share/jupyterhub/custom_templates
COPY theme/static /usr/local/share/jupyterhub/static/custom
COPY images/hub/hybrid_authenticator.py /usr/local/lib/python3.12/site-packages/hybrid_authenticator.py

USER 1000

