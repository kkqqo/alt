<?php
namespace App;
class Config extends Model {
    public static function _($name, $value = null) {
       
        if ($value != "") {
            $config = self::All()["user"][$name];
            if (!$config instanceof Model) {
                $config = new Config();
                $config->name = $name;
            }

            $config->value = $value;
            $config->save();
        } else {
            return self::All()["user"][$name];
        }
    }

    public function __toString() {
        return $this->value;
    }

    private static $_config = [];
    public static function All() {
        if (sizeof(self::$_config))return self::$_config;
        // system config
        $config = parse_ini_file(System::Root() . "/config.ini", true);

        // user config
        foreach(parse_ini_file(CMS_ROOT . "/config.ini", true) as $cat => $ar) {
            foreach($ar as $k => $v) {
            	if($cat=="user"){
            		$v=str_replace("{username}",\App::User()->username,$v);
            		$v=str_replace("{language}",\My::Language(),$v);
            	}
            	$config[$cat][$k] = $v;
            }
        }
        

        
        foreach(Config::find() as $c) {
            $config["user"][$c->name] = $c;
        }

        self::$_config = $config;
        return $config;
    }
}

?>