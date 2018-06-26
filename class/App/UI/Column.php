<?
namespace App\UI;

use JsonSerializable;
use Closure;

class Column implements JsonSerializable
{
    public $name;
    public $title;
    public $data;
    public $orderable = false;
    public $searchable = false;
    public $searchType = "text";
    public $searchOptions = [];
    public $type = "text";
    public $alink = null;
    public $descriptor = [];
    public $width = null;
    public $className = [];

    public $format = null;
    public $searchCallback = null;

    public $editable = false;
    public $editType = 'text';
    public $editData;
    public $wrap = false;
    public $noHide = false;

    public $align = null;

    public $searchOptGroups = null;
    public $searchOptValue = null;
    public $searchMethod;

    public function align($align)
    {
        $this->align = $align;
        return $this;
    }

    public function noHide()
    {
        $this->noHide = true;
        return $this;
    }

    public function width($width)
    {
        $this->width = $width;
        return $this;
    }

    public function editable($type = "text", $data)
    {
        $this->editable = true;
        $this->editType = $type;
        $this->editData = $data;
        if (is_array($data)) {
            $this->editData = [];
            foreach ($data as $k => $v) {
                $this->editData[] = ["value" => $k, "label" => $v];
            }
        }
        return $this;
    }

    public function format($format)
    {
        $this->format = $format;
        $this->raw = true;
        return $this;
    }

    public function gf($descriptor)
    {
        $this->descriptor[] = $descriptor;
        return $this;
    }

    public function alink($alink = null)
    {
        $this->raw = true;
        $this->alink = $alink;
        return $this;
    }

    public function wrap()
    {
        $this->wrap = true;
        return $this;
    }

    public function ss()
    {
        $this->orderable = true;
        $this->searchable = true;
        $this->searchMethod = "like";
        return $this;
    }

    public function search()
    {
        $this->searchable = true;
        $this->searchMethod = "like";
        return $this;
    }

    public function sort()
    {
        return $this->order();
    }

    public function order()
    {
        $this->orderable = true;
        return $this;
    }

    public function searchCallBack($callback)
    {
        $this->searchable = true;
        $this->searchCallback = $callback;
        return $this;
    }

    public function searchSelect2($objects, $display_member, $value_member)
    {
        $this->searchable = true;
        $this->searchOptions = array($objects, $display_member, $value_member);
        $this->searchType = 'select2';
        $this->searchMethod = "equal";
        return $this;
    }

    public function searchDate()
    {
        $this->searchable = true;
        $this->searchType = 'date';
        $this->searchMethod = "date";
        return $this;
    }

    public function searchEq()
    {
        $this->searchable = true;
        $this->searchType = 'equal';
        $this->searchMethod = "equal";
        return $this;
    }

    public function searchSingle($objects, $display_member, $value_member)
    {
        $this->searchable = true;
        $this->searchOptions = array($objects, $display_member, $value_member);
        $this->searchType = 'multiselect';
        $this->searchMethod = "equal";
        return $this;
    }

    public function searchMultiple($objects, $display_member, $value_member)
    {
        $this->searchable = true;
        $this->searchOptions = array($objects, $display_member, $value_member);
        $this->searchType = 'multiselect';
        $this->searchMultiple = true;
        $this->searchMethod = "multiple";
        return $this;
    }

    public function searchOption($objects, $display_member, $value_member)
    {
        $this->searchable = true;
        $this->searchOptions = array($objects, $display_member, $value_member);
        $this->searchType = 'select';
        $this->searchMethod = "equal";
        return $this;
    }

    public function searchOptGroup($groups, $value)
    {
        $this->searchOptGroups = $groups;
        $this->searchOptValue = $value;
        return $this;
    }

    public function _searchOption()
    {
        $data = [];
        $display_member = $this->searchOptions[1];
        $value_member = $this->searchOptions[2];
        if (!$value_member) {
            $value_member = $this->data;
        }

        foreach ($this->searchOptions[0] as $k => $v) {
            if (is_object($v)) {
                $d = [
                    "label" => $display_member ? \My\Func::_($display_member)->call($v) : (string)$v,
                    "value" => \My\Func::_($value_member)->call($v)
                ];
                if ($this->searchOptValue) {
                    $d["group"] = \My\Func::_($this->searchOptValue)->call($v);
                }

                $data[] = $d;
            } else {
                $data[] = ['label' => $v, 'value' => $k];
            }
        }
        return $data;
    }

    public function getData($object, $k)
    {
        $result = $object;
        $last_obj = $object;
        foreach ($this->descriptor as $descriptor) {
            $result = \My\Func::_($descriptor)->call($result);
            if (is_object($result)) {
                $last_obj = $result;
            }
            if (is_string($descriptor)) {
                $htmlspecialchars = true;
            }
        }

        if ($this->format) {
            $result = \My\Func::_($this->format)->call($result);
            $htmlspecialchars = false;
        }


        if ($this->alink && $last_obj) {
            $htmlspecialchars = false;


            $a = html("a")->href($last_obj->uri($this->alink));
            $a->text($result);
            $result = $a;
        }
        return $result;
    }

    public function jsonSerialize()
    {
        $data = [];
        $data["name"] = $this->name;
        $data["title"] = $this->title;
        $data["data"] = $this->data;
        $data["orderable"] = $this->orderable;
        $data["searchable"] = $this->searchable;
        $data["searchType"] = $this->searchType;
        $data["searchOption"] = $this->_searchOption();
        $data["searchOptGroup"] = $this->searchOptGroups;
        $data["searchMultiple"] = $this->searchMultiple;
        $data["searchMethod"] = $this->searchMethod;
        $data["editable"] = $this->editable;
        $data["editType"] = $this->editType;
        $data["editData"] = $this->editData;
        $data["wrap"] = $this->wrap;
        $data["noHide"] = $this->noHide;
        if ($this->align) {
            $data["cellStyle"]["text-align"] = $this->align;
        }
        if ($this->width) $data["width"] = $this->width;
        if ($this->className) $data["className"] = implode(" ", $this->className);
        return $data;
    }


}

