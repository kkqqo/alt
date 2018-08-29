<?

class Module_install extends ALT\Page
{
    public function rmove($src, $dest)
    {

        // If source is not a directory stop processing
        if (!is_dir($src)) return false;
    
        // If the destination directory does not exist create it
        if (!is_dir($dest)) {
            if (!mkdir($dest)) {
                // If the destination directory could not be created stop processing
                return false;
            }
        }
    
        // Open the source directory to read in files
        $i = new DirectoryIterator($src);
        foreach ($i as $f) {
            if ($f->isFile()) {
                rename($f->getRealPath(), "$dest/" . $f->getFilename());
            } else if (!$f->isDot() && $f->isDir()) {
                $this->rmove($f->getRealPath(), "$dest/$f");
                unlink($f->getRealPath());
            }
        }
        unlink($src);
    }

    public function get()
    {
        $t = $this->createT($this->getGitHub());
        $t->subHTML("", [$this, "getChild"], "full_name");
        $t->add("Name", "full_name");

        $this->write($t);
    }

    public function getChild($full_name)
    {
        $t = $this->createT($this->getGitHubRelease($full_name));
        $t->add("Tag name", "tag_name");
        $t->add("Install", function ($o) use ($full_name) {

            $tag_name = $o["tag_name"];
            $url = "https://github.com/$full_name/archive/$tag_name.tar.gz";
            $btn = html("a");
            $btn->href("Module/install/github?url=$url&name=$full_name&tag=$tag_name");
            $btn->text("install");

            return $btn;
        });
        $this->write($t);
    }

    public function unzip($file)
    {
        $pi = $this->app->pathInfo();

        $name = basename($file);
        $name = substr($name, 0, -7);

        $phar_path = "phar://" . $file;
        $target = $pi["cms_root"] . "/pages";

        $phar = new PharData($phar_path);
        $phar->extractTo($target);

        $this->rmove($target . "/$name/src", $pi["cms_root"] . "/pages");

        //array_map('unlink', glob("path/to/temp/*"));


        echo "test";
        die();

    }

    public function github($url, $name, $tag)
    {
        $ret = file_get_contents($url);
        $pi = $this->app->pathInfo();

        $name = basename($name);

        $file = $pi["cms_root"] . "/pages/$name-$tag.tar.gz";
        file_put_contents($file, $ret);

        $this->unzip($file);


        echo "done";
        return;



        $file = $pi["cms_root"] . "/pages/file.zip";
        file_put_contents($file, $ret);

        $zip = new ZipArchive();
        if ($zip->open($file) === true) {
            $zip->extractTo($pi["cms_root"] . "/pages/rdb", ["r-db-1.0.0/src"]);
            $zip->close();
            echo "ok";
        } else {
            echo "failed";
        }

        die();
        return;

        PharData::extractTo(__DIR__ . "/test", $url);
        echo "ok";

    }

    public function getGitHubRelease($full_name)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["User-Agent: hostlink/r-alt"]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); // Return data inplace of echoing on screen
        curl_setopt($ch, CURLOPT_URL, "https://api.github.com/repos/$full_name/releases");
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        $ret = curl_exec($ch);
        curl_close($ch);

        $ret = json_decode($ret, true);

        return $ret;
    }

    public function getGitHub()
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["User-Agent: hostlink/r-alt"]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); // Return data inplace of echoing on screen
        curl_setopt($ch, CURLOPT_URL, "https://api.github.com/search/repositories?q=user:hostlink");
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        $ret = curl_exec($ch);
        curl_close($ch);

        $ret = json_decode($ret, true);

        return $ret['items'];

        return $ret;
    }

}