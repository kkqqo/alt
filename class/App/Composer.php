<?php

namespace App;

class Composer
{
    public function __construct()
    {
    }

    public function auth(){
        return json_decode(file_get_contents($this->path()."/auth.json"),true);
    }

    public function installed()
    {
        $ret = self::exec("show -f json");
        return json_decode($ret, true)["installed"];
    }

    public function show()
    {
        return self::exec("show -f json");
    }

    public function package($name)
    {
        foreach ($this->installed() as $p) {
            if ($p["name"] == $name) {
                $package = new Package();
                $package->name = $p["name"];
                $package->version = $p["version"];
                $package->description = $p["description"];
                $package->path = getcwd() . "/composer/vender/" . $name;

                return $package;
            }
        }
    }

    public function exec($command)
    {
        $cwd = getcwd();

        putenv("COMPOSER_HOME=" . $this->path());

        $phar = $this->phar();
        chdir($this->path());

        if ($command) {
            $ret = `php $phar $command 2>&1`;
        } else {
            $ret = `php $phar 2>&1`;
        }

        chdir($cwd);

        return $ret;
    }

    public function hasPackage($package)
    {
        foreach ($this->installed() as $p) {
            if ($p["name"] == $package) {
                return true;
            }
        }
        return false;
    }

    public function path()
    {
        $p = \App::_()->pathInfo();
        return $p["composer_root"];
    }

    public function packageSuggest($package)
    {
        $suggest = $this->exec("suggests $package");
        $suggest = explode("\n", $suggest);
        array_walk($suggest, "trim");
        $suggest = array_filter($suggest, "strlen");
        return $suggest;
    }

    public function suggests()
    {
        $suggest = $this->exec("suggests");
        $suggest = explode("\n", $suggest);
        array_walk($suggest, "trim");
        $suggest = array_filter($suggest, "strlen");
        return $suggest;
    }

    public function info($checkupdate = false)
    {
        if ($checkupdate) {
            $info = $this->exec("show -l --format=json");
        } else {
            $info = $this->exec("show --format=json");
        }

        return json_decode($info, true)["installed"];
    }

    public function config()
    {
        if (file_exists($file = $this->path() . "/composer.json")) {
            return json_decode(file_get_contents($file), true);
        }
        return [];
    }

    public function lockConfig()
    {
        if (file_exists($file = $this->path() . "/composer.lock")) {
            return json_decode(file_get_contents($file), true);
        }
        return [];
    }

    public function phar()
    {
        if (!file_exists($file = $this->path() . "/composer.phar")) {
            file_put_contents($file, fopen("https://getcomposer.org/composer.phar", 'r'));
        }
        return $file;
    }

    public function changeOwn()
    {
        $folder = $this->path();
        `find $folder -type d -exec chmod 0777 {} +`;
        `find $folder -type f -exec chmod 0777 {} +`;
    }

    public function removeAll()
    {
        $folder = $this->path();
        `rm -rf $folder`;
    }

    public function remove($package)
    {
        return $this->exec("remove $package");
    }

    public function install($package, $version)
    {

        $config = $this->config();

        if ($config["require"][$package]) {
            return;
        }

        $ret = $this->exec("require $package");
        $this->changeOwn();

        return $ret;
    }
}
