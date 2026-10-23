// Copyright (c) 2026 Torviello.
use std::collections::BTreeMap;
use std::str::FromStr;

use serde::Deserialize;

#[derive(Debug, Clone, Default, Deserialize)]
#[serde(default, deny_unknown_fields)]
#[allow(clippy::struct_excessive_bools)]
pub struct Accelerators {
    pub cuda: bool,
    pub metal: bool,
    pub vulkan: bool,
    pub rocm: bool,
    pub coreml: bool,
    pub directml: bool,
}

impl Accelerators {
    #[must_use]
    pub fn selected(&self) -> Option<&'static str> {
        [
            ("cuda", self.cuda),
            ("metal", self.metal),
            ("vulkan", self.vulkan),
            ("rocm", self.rocm),
            ("coreml", self.coreml),
            ("directml", self.directml),
        ]
        .into_iter()
        .find_map(|(name, enabled)| enabled.then_some(name))
    }

    #[must_use]
    pub fn as_map(&self) -> BTreeMap<&'static str, bool> {
        BTreeMap::from([
            ("cuda", self.cuda),
            ("metal", self.metal),
            ("vulkan", self.vulkan),
            ("rocm", self.rocm),
            ("coreml", self.coreml),
            ("directml", self.directml),
        ])
    }
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum AuthMode {
    #[default]
    Local,
    Oidc,
}

impl FromStr for AuthMode {
    type Err = ();

    fn from_str(value: &str) -> Result<Self, Self::Err> {
        match value {
            "local" => Ok(Self::Local),
            "oidc" => Ok(Self::Oidc),
            _ => Err(()),
        }
    }
}

#[derive(Debug, Clone, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct AccessControl {
    /// When true, routes not listed in either list are public.
    pub default_public: bool,
    pub public_routes: Vec<String>,
    pub private_routes: Vec<String>,
}

impl Default for AccessControl {
    fn default() -> Self {
        Self {
            default_public: false,
            public_routes: vec![
                "/health".to_owned(),
                "/health/live".to_owned(),
                "/health/ready".to_owned(),
                "/api/v1/health".to_owned(),
                "/metrics".to_owned(),
                "/docs".to_owned(),
                "/openapi.yaml".to_owned(),
                "/assets/scalar.js".to_owned(),
            ],
            private_routes: Vec::new(),
        }
    }
}

impl AccessControl {
    /// Explicit private routes win over public routes and the default.
    #[must_use]
    pub fn requires_auth(&self, route: &str) -> bool {
        if self
            .private_routes
            .iter()
            .any(|candidate| candidate == route)
        {
            return true;
        }
        if self
            .public_routes
            .iter()
            .any(|candidate| candidate == route)
        {
            return false;
        }
        !self.default_public
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accelerators_report_the_first_enabled_target() {
        assert!(Accelerators::default().selected().is_none());
        let accelerators = Accelerators {
            vulkan: true,
            metal: true,
            ..Accelerators::default()
        };
        assert_eq!(accelerators.selected(), Some("metal"));
        assert!(accelerators.as_map()["metal"]);
        assert!(!accelerators.as_map()["cuda"]);
    }

    #[test]
    fn auth_mode_parses_known_values_only() {
        assert_eq!("local".parse::<AuthMode>().expect("local"), AuthMode::Local);
        assert_eq!("oidc".parse::<AuthMode>().expect("oidc"), AuthMode::Oidc);
        assert!("other".parse::<AuthMode>().is_err());
    }

    #[test]
    fn access_control_priority_is_private_public_default() {
        let mut control = AccessControl::default();
        assert!(control.requires_auth("/models/{modelId}"));
        assert!(!control.requires_auth("/health"));
        assert!(!control.requires_auth("/metrics"));
        control.public_routes.push("/models".to_owned());
        control.private_routes.push("/models".to_owned());
        assert!(control.requires_auth("/models"));
        assert!(!control.requires_auth("/metrics"));
        control.default_public = true;
        assert!(!control.requires_auth("/other"));
        control.private_routes.push("/other".to_owned());
        assert!(control.requires_auth("/other"));
    }
}
