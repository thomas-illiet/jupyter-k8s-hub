"""Combined OIDC and LDAP authentication for JupyterHub."""

from jupyterhub.handlers.login import LoginHandler
from jupyterhub.utils import url_path_join
from ldapauthenticator import LDAPAuthenticator
from oauthenticator.generic import GenericOAuthenticator


class HybridAuthenticator(GenericOAuthenticator):
    """Use OIDC for SSO and LDAP for submitted username/password credentials."""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.ldap = LDAPAuthenticator(parent=self, config=self.config)

    def login_url(self, base_url):
        # Keep JupyterHub on its standard login page; /oauth_login remains the
        # explicit entry point for the SSO flow registered by OAuthenticator.
        return url_path_join(base_url, "login")

    async def authenticate(self, handler, data=None, **kwargs):
        if data and data.get("username") and data.get("password"):
            return await self.ldap.authenticate(handler, data)
        return await super().authenticate(handler, data, **kwargs)

    def get_handlers(self, app):
        handlers = super().get_handlers(app)
        # OAuthenticator registers /logout too; JupyterHub already owns it.
        return [handler for handler in handlers if handler[0] != r"/logout"]

