<?php
use App\Config;
use App\System;
use App\User;

class _index extends ALT\Page\Login
{
    public function get($r)
    {
        $config = $this->app->config;
        if ($this->app->logined()) {
            $user = $this->app->user;

            if ($user->secret == "" && $config["user"]["2-step verification"]) {
                $this->response = $this->response->withHeader("Location", "User/2step?auto_create=1");
                return;
            }

            if ($p = $user->default_page) {
                $this->response = $this->response->withHeader("Location", $p);
            } else {
                $this->response = $this->response->withHeader("Location", "Dashboard");
            }
            
            return;
        }

        if ($_COOKIE["app_username"]) {
            $w = [];
            $w[] = ["username=?", $_COOKIE["app_username"]];

            if ($user = User::first($w)) {
                $this->response = $this->response->withHeader("Location", "lockscreen?username=" . $_COOKIE["app_username"]);
                return;
            }
        }

        $this->addLib("twbs/bootstrap");
        $this->addLib("components/font-awesome");
        $this->addLib("driftyco/ionicons");
        $this->addLib("iCheck");
        $this->addLib("bootboxjs");
        $data["title"] = $config["user"]["title"];
        $data["company"] = $config["user"]["company"];
        $data["logo"] = $config["user"]["logo"];
        $data["version"] = $this->app->version();

        $data["r"] = $r;
        if ($config["user"]["2-step verification"] && !System::IP2StepExemptCheck($_SERVER['REMOTE_ADDR'])) {
            $data["ip2step"] = true;
        }

        return $data;
    }

    public function __call($name, $args)
    {
        if ($this->app->logined()) {
            $this->response = $this->response->withHeader("Location", "404_not_found");
        } else {
            $base = $this->request->getUri()->getBasePath();
            $this->response = $this->response->withHeader("Location", $base . "/?r=" . $name);
        }
    }

}