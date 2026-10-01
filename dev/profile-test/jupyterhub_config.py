import asyncio

from jupyterhub.auth import DummyAuthenticator
from jupyterhub.handlers.base import BaseHandler
from jupyterhub.spawner import Spawner
from traitlets import default


PROFILES = [
    ("python", "Python Essentials", "Python 3.12, Git, and automation. 2 CPU · 4 GB RAM"),
    ("datascience", "Data Science", "Pandas, SciPy, and visualization. 4 CPU · 8 GB RAM"),
    ("node", "Web & Node.js", "Node.js 22 and TypeScript. 2 CPU · 4 GB RAM"),
    ("java", "Java Enterprise", "OpenJDK 21 and Maven. 4 CPU · 8 GB RAM"),
    ("cuda", "AI / GPU", "PyTorch and CUDA 12. 8 CPU · 16 GB RAM · 1 GPU"),
]


class ProfilePreviewSpawner(Spawner):
    @default("options_form")
    def _options_form_default(self):
        profiles = []
        for index, (slug, name, description) in enumerate(PROFILES):
            checked = " checked" if index == 0 else ""
            profiles.append(
                f'<label for="profile-item-{slug}" class="profile js-profile-label">'
                f'<div class="radio"><input type="radio" name="profile" '
                f'id="profile-item-{slug}" value="{slug}"{checked}></div>'
                f'<div><h3>{name}</h3><p>{description}</p></div></label>'
            )
        return '<div class="form-group" id="kubespawner-profiles-list">' + "".join(profiles) + "</div>"

    def options_from_form(self, formdata):
        return {"profile": formdata.get("profile", [PROFILES[0][0]])[0]}

    async def start(self):
        # Keep the real spawn-pending page visible long enough for visual testing,
        # then deliberately exercise JupyterHub's failed-spawn state.
        await asyncio.sleep(30)
        raise RuntimeError("Intentional profile-preview spawn failure")

    async def stop(self, now=False):
        return None

    async def poll(self):
        return 0


class ErrorThemePreviewHandler(BaseHandler):
    """Render production error templates for local visual regression captures."""

    async def get(self, status_code):
        status_code = int(status_code)
        self.set_status(status_code)
        self.finish(
            await self.render_template(
                "error.html",
                status_code=status_code,
                status_message="Theme preview",
            )
        )


c = get_config()  # noqa: F821
c.JupyterHub.bind_url = "http://0.0.0.0:8000"
c.JupyterHub.hub_bind_url = "http://0.0.0.0:8081"
c.JupyterHub.hub_connect_url = "http://hub-profile-test:8081"
c.ConfigurableHTTPProxy.should_start = False
c.ConfigurableHTTPProxy.api_url = "http://proxy:8001"
c.JupyterHub.authenticator_class = DummyAuthenticator
c.Authenticator.allow_all = True
c.DummyAuthenticator.password = "test"
c.JupyterHub.spawner_class = ProfilePreviewSpawner
c.JupyterHub.extra_handlers = [
    (r"/theme-preview/(?P<status_code>400|403|500)", ErrorThemePreviewHandler),
]
c.JupyterHub.template_paths = ["/usr/local/share/jupyterhub/custom_templates"]
c.JupyterHub.template_vars = {
    "product_name": "BNP Paribas Code Station",
    "product_tagline": "A secure development environment, ready in seconds.",
    "support_url": "mailto:platform@example.com",
}
c.JupyterHub.cookie_secret_file = "/tmp/jupyterhub_cookie_secret"
c.JupyterHub.db_url = "sqlite:////tmp/jupyterhub-profile-test.sqlite"
c.JupyterHub.log_level = "INFO"
