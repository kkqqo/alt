Vue.component("rt-info", {
    template: `
<div>{{from}} - {{to}} of {{total}}</div>
`,
    props: ["from", "to", "total"]
});


Vue.component("rt-pagination", {
    template: `
<div class="btn-group pull-left">
    <button data-toggle="tooltip" title="最前一頁" class="btn btn-default btn-sm" type="button" @click.prevent="$emit('first-page')"
        :disabled="firstPageDisabled">
        <span class="glyphicon glyphicon-step-backward"></span>
    </button>
    <button data-toggle="tooltip" title="上一頁" class="btn btn-default btn-sm" type="button" @click.prevent="$emit('prev-page')"
        :disabled="prevPageDisabled">
        <span class="glyphicon glyphicon-chevron-left"></span>
    </button>
    <div class="pull-left" style="user-select: none;">
        <input style="width:60px" min="1" :max="pageCount" type="number" class="form-control input-sm" v-model="p" @change="changePage">
    </div>
    <button data-toggle="tooltip" title="下一頁" class="btn btn-default btn-sm" type="button" @click.prevent="$emit('next-page')"
        :disabled="nextPageDisabled">
        <span class="glyphicon glyphicon-chevron-right"></span>
    </button>
    <button data-toggle="tooltip" title="最後一頁" class="btn btn-default btn-sm" type="button" @click.prevent="$emit('last-page')"
        :disabled="lastPageDisabled">
        <span class="glyphicon glyphicon-step-forward"></span>
    </button>
</div>
`,
    props: {
        page: {
            type: Number,
            require: true,
            default: 1
        }, pageCount: {
            type: Number,
            default: 1
        }
    },
    computed: {
        firstPageDisabled() {
            return this.page <= 1;
        },
        prevPageDisabled() {
            return this.page <= 1;
        }, nextPageDisabled() {
            return this.pageCount == this.page;
        }, lastPageDisabled() {
            return this.pageCount == this.page;
        }
    },
    watch: {
        page: function (v) {
            console.log(v);
            this.p = v;
        }
    },
    data: function () {
        return {
            p: this.page
        };
    },
    methods: {
        changePage: function () {
            this.$emit("change-page", this.p);
        }
    }
});


Vue.component("rt-head", {
    template: `
<thead>
    <tr>
        <th v-if="hasHideColumn" class="width:29px;max-width:29px">
            <button class="btn btn-default btn-xs" @click="toggleChild">
                <i v-if="!showChild" class="fa fa-chevron-up"></i>
                <i v-if="showChild" class="fa fa-chevron-down"></i>
            </button>
        </th>
        <slot></slot>
    </tr>
    <tr v-if="hasSearchColumn">
        <td v-if="hasHideColumn">
        </td>
        <td v-for="(column,key) in columns" :key="key" v-if="column.display()">
           <template v-if="column.searchable">
               <template v-if="column.searchType=='text'">
                   <div>
                        <input v-model="search[column.field]" class="form-control input-sm search" type="text" @keyup.enter="doSearch()" />
                   </div>
               </template>
               <template v-if="column.searchType=='date'">
                   <div class="date input-group input-group-sm">
                        <input class="form-control date" placeholder="from" :data-field="column.field" data-search="from"/>
                        <span class="input-group-btn">
                            <button type="button" class="search-clear-btn btn btn-default" @click="clearSearchDate(column,'from')">
                                <i class="glyphicon glyphicon-remove"></i>
                            </button>
                        </span>
                   </div>

                   <div class="date input-group input-group-sm">
                        <input class="form-control date" placeholder="to" :data-field="column.field" data-search="to"/>
                        <span class="input-group-btn">
                            <button type="button" class="search-clear-btn btn btn-default" @click="clearSearchDate(column,'to')">
                                <i class="glyphicon glyphicon-remove"></i>
                            </button>
                        </span>
                   </div>
               </template>
               <template v-if="column.searchType=='select'">
                   <select class="form-control" v-model="search[column.field]" @change="doSearch">
                       <option></option>
                       <option v-for="opt in column.searchOption" v-text="opt.label" v-bind:value="opt.value"></option>
                   </select>
               </template>
               <template v-if="column.searchType=='multiselect'">
                    <select multiple class="form-control" @change="doSearch" search-type="multiselect" :data-field="column.field">
                        <option v-for="opt in column.searchOption" v-text="opt.label" v-bind:value="opt.value"></option>
                    </select>
               </template>
               <template v-if="column.searchType=='select2'">
                    <select class="form-control" v-model="search[column.field]" :data-field="column.field" search-type="select2">
                        <option></option>
                        <option v-for="opt in column.searchOption" v-text="opt.label" v-bind:value="opt.value"></option>
                    </select>
                </template>
           </template>
        </td>
    </tr>
</thead>
`,
    props: {
        hideIndex: Number
    },
    data() {
        return {
            showChild: false,
            search: {},
            columns: []
        };
    },
    mounted: function () {
        this.columns = this.$slots.default.filter(o => {
            if (o.componentOptions == undefined) return false;
            return o.componentOptions.tag == "rt-column";
        }).map(o => {
            return o.componentInstance;
        });


        this.columns.forEach(column => {
            column.$on("toggle-visible", function (a) {

                this.$parent.$emit("toggle-visible", {
                    name: this.field,
                    visible: a
                });
            });
        });

        this.$on("sort", a => {
            this.columns.forEach(column => {
                if (column.field != a.field) {
                    column.dir = "";
                }
            });
        });

        this.columns.forEach(c => {
            if (c.searchType == "multiselect") {
                this.search[c.field] = [];
            } else if (c.searchType == "date") {
                this.search[c.field] = {
                    from: "",
                    to: "",
                };
            }
        });

        this.$nextTick(function () {
            $(() => {
                $(".rt [search-type='multiselect']").each((i, o) => {
                    $(o).multiselect({
                        buttonClass: "btn btn-default btn-xs",
                        enableFiltering: true
                    });
                    $(o).on("change", () => {
                        var field = $(o).attr("data-field");
                        this.search[field] = $(o).val();
                        this.doSearch();
                    });
                });

                $(".rt [search-type='select2']").each((i, o) => {
                    $(o).select2();
                    $(o).on("change", () => {
                        var field = $(o).attr("data-field");
                        this.search[field] = $(o).val();
                        this.doSearch();
                    });
                });
                $(".rt input.date").each((i, o) => {
                    $(o).daterangepicker({
                        singleDatePicker: true,
                        "opens": "center",
                        "showDropdowns": true,
                        "autoApply": true,
                        "autoUpdateInput": false,
                        locale: {
                            format: 'YYYY-MM-DD'
                        }
                    });

                    $(o).on('apply.daterangepicker', (ev, picker) => {
                        var o = picker.element.get(0);
                        $(o).val(picker.startDate.format("YYYY-MM-DD"));

                        var field = $(o).attr("data-field");
                        if ($(o).attr("data-search") == "from") {
                            this.search[field].from = picker.startDate.format("YYYY-MM-DD");
                        } else {
                            this.search[field].to = picker.startDate.format("YYYY-MM-DD");
                        }

                        this.$emit("search", this.search);

                    });
                });
            });
        });
    },
    computed: {
        hasSearchColumn() {
            return this.columns.some(function (c) {
                return c.searchable;
            });
        },
        hasHideColumn() {
            return this.columns.some(function (c) {
                return c.hide;
            });
        }
    },
    methods: {
        toggleChild() {
            this.showChild = !this.showChild;
            this.$emit("toggle-child", this.showChild);
        },
        clearSearchDate(column, v) {
            $("[data-field='" + column.field + "'][data-search='" + v + "']").val("");

            this.search[column.field][v] = "";
            this.doSearch();
        },
        doSearch: function () {
            this.$emit('search', this.search);
        }
    }
});

Vue.component("rt-body", {
    template: `
<tbody>
    <template v-for="(r,index) in data">
        <tr :style="getStyle(r)" @click="rowClicked(r)" :class="{active:r._selected}">
            <td v-if="hasHideColumn">
                <button class="btn btn-default btn-xs" @click="toggleRowChild(index)" @mouseenter="mouseEnter(index)" @mouseleave="mouseLeave(index)">
                    <i v-if="!showIndex[index]" class="fa fa-chevron-up"></i>
                    <i v-if="showIndex[index]" class="fa fa-chevron-down"></i>
                </button>
            </td>
            <td v-for="column in columns" @click="cellClicked(column,index,r)" v-if="column.display()"
                :style="getCellStyle(column,index,r)" >
                <template v-if="isEditMode(column,index)" >
                    <template v-if="column.editType=='text'">
                        <input type="text" class="form-control input-sm" v-bind:value="getValue(r[column.field])" @blur="updateData(index,r,column,$event.target.value)"/>
                    </template>
                    <template v-else-if="column.editType=='select'">
                        <select class="formControl" @blur="updateData(index,r,column,$event.target.value)">
                            <option v-for="opt in column.editData" v-bind:value="opt.value" v-text="opt.label"
                            :selected="opt.value==r[column.field].value"></option>
                        </select>
                    </template>
                    <template v-else-if="column.editType=='date'">
                        <input type="text" class="form-control input-sm" v-bind:value="getValue(r[column.field])" @blur="updateData(index,r,column,$event.target.value)"/>
                    </template>
                </template>
                <template v-else>
                    <input type="checkbox" v-if="column.cell(r).type=='deletes'"/>
                    <button class="btn btn-xs btn-danger" v-else-if="column.cell(r).type=='delete'" @click="deleteRow(r[column.field].uri)"><i class="fa fa-times"></i></button>
                    <button class="btn btn-xs btn-default" v-else-if="column.cell(r).type=='sub-row'" @click="toggleSubRow(index,r)">
                        <i v-if="subRow[index]" class="fa fa-minus"></i>
                        <i v-if="!subRow[index]" class="fa fa-plus"></i>
                    </button>
                    <a v-else-if="column.cell(r).type=='link'" :href="column.cell(r).href" v-html="column.cell(r).content"></a>
                    <div v-else v-html="column.cell(r).content" :style="column.cell(r).style">
                    </div>
                </template>
            </td>
        </tr>
        <tr class="child" v-show="showChild(index)">
            <td :colspan="showColumnCount">
                <ul>
                    <li v-for="column in columns" v-if="column.hide">
                        <b v-html="column.title"></b>&nbsp;&nbsp;<span v-html="getValue(r[column.field])" />
                    </li>
                </ul>
            </td>
        </tr>    
        <tr v-if="subRow[index]">
            <td :colspan="showColumnCount" v-html="subRow[index]">
            </td>
        </tr>
    </template>
</tbody>
`,
    props: {
        columns: Array,
        data: Array,
        showResponsive: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            editMode: false,
            editIndex: null,
            editField: null,
            showIndex: [],
            subRow: [],
            hoverChild: []
        };
    },
    computed: {
        hasHideColumn() {
            return this.columns.some(function (c) {
                return c.hide;
            });
        },
        showColumnCount() {
            return this.columns.filter(c => {
                return !c.hide;
            }).length + 1;
        }
    },
    methods: {
        rowClicked(data) {
            if (!this.$parent.selectable) return;
            data._selected = !data._selected;
            this.$forceUpdate();
        },
        getCellStyle(col, index, data) {
            var style = {};
            if (col.align) {
                style["text-align"] = col.align;
            }
            return style;
        },
        mouseLeave(index) {
            this.hoverChild[index] = false;
            this.$forceUpdate();
            //                console.log("mouseleave",index);
        },
        mouseEnter(index) {
            this.hoverChild[index] = true;
            this.$forceUpdate();
            //                console.log("mouseenter",index);
        },
        showChild(index) {
            if (this.hoverChild[index]) return true;
            return this.showIndex[index];
        },
        toggleSubRow(index, r) {
            if (this.subRow[index]) {
                this.subRow[index] = null;
                this.$forceUpdate();
                return;
            }
            this.$http.get(r["[subhtml]"].url).then(resp => {
                this.subRow[index] = resp.body;
                this.$forceUpdate();
                this.$nextTick(function () {
                    var div = $(this.subRow[index]);
                    div.each(function (i, o) {
                        if (o.tagName == "SCRIPT") {
                            eval(o.innerHTML);
                        }
                    });
                });
            });
        },
        deleteRow(uri) {
            if (confirm("Are your sure?")) {
                this.$http.get(uri).then(resp => {
                    this.$emit("data-deleted");
                });
            }
        },
        toggleChild(value) {
            this.data.forEach((r, i) => {
                this.showIndex[i] = value;
            });
            this.$forceUpdate();
        },
        toggleRowChild(index) {
            if (this.showIndex[index]) {
                this.showIndex[index] = false;
            } else {
                this.showIndex[index] = true;
            }
            this.$forceUpdate();
        },
        isShowChild(index) {
            return this.showIndex[index];
        },
        updateData: function (index, r, column, value) {
            this.editMode = false;

            if (column.editType == "select") {
                if (r[column.field].value != value) {
                    this.data[index][column.field].value = value;
                    this.data[index][column.field].content = column.editData[value].label;
                    this.$emit("update-data", r._key, column.field, value);
                }
            } else {
                if (r[column.field] != value) {
                    r[column.field] = value;
                    this.$emit("update-data", r._key, column.field, value);
                }
            }
        },
        isEditMode: function (column, index) {
            if (!this.editMode) return false;
            if (this.editField == column.field && this.editIndex == index) {
                return true;
            }
            return false;
        },
        cellClicked: function (column, index, r) {
            if (!column.editable) return false;

            this.editMode = true;
            this.editField = column.field;
            this.editIndex = index;
        },
        getValue: function (v) {
            if (typeof v === 'string') {
                return v;
            }
            return v.content;
        }, getContent: function (v) {
            if (typeof v === 'string') {
                return v;
            }
            return v.content;
        }, getStyle: function (r) {
            if (r._row == undefined) return {};
            return r._row.style;
        }
    }, mounted: function () {

    }
});

Vue.component("rt-column", {
    template: `<th class="unselectable"
    v-if="display()"
    :class="{
        sortable:sortable,
        sorting_desc:(dir=='desc'),
        sorting_asc:(dir=='asc')
    }" @click='sort' :style="style">
    <div :title="title" style="overflow:hidden">{{title}}</div>
    <div ref="resizer"></div>
    <template v-if="type=='deletes'">
       <button class='btn btn-xs btn-danger' @click="$emit('deletes')"><i class='fa fa-times'></i></button>
    </template>
</th>`,
    props: {
        type: String,
        field: String,
        title: String,
        sortable: Boolean,
        sortDir: String,
        searchable: Boolean,
        searchMultiple: Boolean,
        searchType: {
            type: String,
            default: "text"
        }, searchOption: {
            type: Array
        }, editable: Boolean,
        editType: String,
        editData: {
            type: Array
        }, width: String,
        maxWidth: String,
        resizable: Boolean,
        fixed: Boolean,
        hidden: Boolean,
        align: String,
        wrap: Boolean
    }, data: function () {
        return {
            isVisible: !this.hidden,
            hide: false,
            index: -1,
            hideIndex: -1,
            dir: this.sortDir
        };
    },
    mounted() {
        var that = this;
        if (this.resizable) {
            this.$nextTick(() => {
                $(() => {
                    $(this.$el).resizable({
                        handles: "e",
                        minWidth: 28,
                        resize(event, ui) {
                            $(that.$refs.resizer).width(ui.size.width);
                        }
                    });
                });

            });
        }
    },
    computed: {
        style() {
            var style = {};
            style.width = this.width;
            style.maxWidth = this.maxWidth;

            return style;
        }

    },
    updated() {


    },
    methods: {
        cell(r) {

            var cell = {
                type: "text",
            };

            if (r[this.field] == null) {
                return cell;
            }

            if (typeof r[this.field] == 'string') {
                cell.content = r[this.field];
            } else {
                for (var i in r[this.field]) {
                    cell[i] = r[this.field][i];
                }
            }

            if (this.wrap) {
                Vue.set(cell, "style", {
                    "word-wrap": "break-word",
                    "white-space": "pre-wrap"
                });
            }
            return cell;

        },
        display() {
            return this.isVisible && !this.hide;
        },
        getWidth() {
            return this.$el.offsetWidth;
        },
        getHeight() {
            return this.$el.offsetHeight;
        },
        getDataValue(data) {
            var v = data[this.field];
            if (typeof v === 'string') {
                return v;
            }
            return v.content;
        },
        sort() {
            if (!this.sortable) return false;
            if (this.dir == "" || this.dir == "asc") {
                this.dir = "desc";
            } else {
                this.dir = "asc";
            }

            this.$parent.$emit("sort", {
                field: this.field,
                dir: this.dir
            });
        }, toggleVisible() {
            this.isVisible = !this.isVisible;
            this.$emit("toggle-visible", this.isVisible);
        }
    }
});

Vue.component("rt-table", {
    template: `
<table class="table table-hover table-condensed">
<thead is="rt-head" 
v-on:toggle-child="toggleChild" 
v-on:toggle-visible="toggleVisible" 
v-on:sort="sortByColumn" 
v-on:search="search" :hide-index="hideIndex"><slot></slot></thead>
<tbody ref="body" is="rt-body" :columns="columns" :data="data" v-on:update-data="updateData" v-on:data-deleted="refresh"></tbody>
</table>
`,
    props: {
        dataUrl: {
            type: String
        },
        cellUrl: {
            type: String
        }, responsive: {
            type: Boolean,
            default: false
        }, sortField: String,
        sortDir: String,
        pageSize: {
            type: Number,
            default: 25
        },
        pageNumber: {
            type: Number,
            default: 1
        }, selectable: Boolean
    },
    watch: {
        page: function () {
            console.log('page changed:' + this.page);
        },
        responsive() {
            this.resize();
        }
    },
    data: function () {
        var storage = $.localStorage.get(this.dataUrl);

        var data = {
            draw: 0,
            page: 1,
            data: [],
            columns: [],
            page_size: this.pageSize,
            total: 0,
            sort: this.sortField,
            sort_dir: this.sortDir,
            searchData: {},
            hideIndex: -1
        };

        if (storage) {
            if (storage.page) {
                data.page = storage.page;
            }

            if (storage.order.column) {
                data.sort = storage.order.column;
            }
            if (storage.order.dir) {
                data.sort_dir = storage.order.dir;
            }
        }

        return data;
    },
    mounted: function () {
        //get the columns 
        var cs = this.$slots.default.filter(function (o) {
            if (o.componentOptions == undefined) return;
            return o.componentOptions.tag == "rt-column";
        });

        this.columns = cs.map(function (c) {
            return c.componentInstance;
        });

        this.columns.forEach((c, i) => {
            c.index = i;
        });

        this.refresh();

        this.columns.forEach(o => {
            if (o.field == this.sort) {
                o.dir = this.sort_dir;
            } else {
                o.dir = null;
            }
        });


        window.addEventListener('resize', this.resize);
    }, computed: {


    }, methods: {
        toggleVisible(data) {
            data.RT2 = 1;
            data.uri = this.dataUrl;
            this.$http.post("UI/save", data).then(resp => {
                console.log(resp);
            });
        },
        hasFixedColumn() {
            return this.columns.some(c => {
                return c.fixed;
            });
        },
        toggleChild(value) {
            this.$refs.body.toggleChild(value);
        },
        updateData(key, field, value) {
            if (!this.cellUrl) {
                console.log("cell-url not found");
                return;
            }
            this.$http.post(this.cellUrl, {
                _pk: key,
                name: field,
                value: value
            }).then((resp) => {
                console.log("done");
            });
        },
        search(data) {
            this.searchData = data;
            this.page = 1;
            this.refresh();
        },
        sortByColumn: function (a) {
            this.sortBy(a.field, a.dir);
        },
        getPage() {
            return this.page;
        },
        getTo() {
            var i = this.page_size * this.page;

            return Math.min(i, this.total);
        },
        getFrom() {
            return this.page_size * (this.page - 1) + 1;
        },
        getPageCount() {
            return Math.ceil(this.total / this.page_size);
        },
        getTotal: function () {
            return this.total;
        },
        setPageSize: function (p) {
            this.page_size = p;
            this.page = 1;
            this.refresh();
        },
        doSomething: function () {
            console.log("do something");
        },
        firstPage: function () {
            this.page = 1;
            this.refresh();
        },
        gotoPage: function (page) {
            this.page = parseInt(page);
            this.refresh();
        },
        prevPage: function () {
            this.page--;
            this.refresh();
        },
        nextPage: function () {
            this.page++;
            this.refresh();
        },
        lastPage: function () {
            this.page = this.getPageCount();
            this.refresh();
        },
        sortBy: function (name, dir) {
            this.sort = name;
            if (dir == undefined) {
                this.sort_dir = "asc";
            } else {
                this.sort_dir = dir;
            }

            this.refresh();
        },
        exportFile(type) {
            this.draw++;
            this.$http.get(this.dataUrl, {
                params: {
                    draw: this.draw,
                    page: this.page,
                    column: this.columns.map(function (s) {
                        return s.field;
                    }),
                    order: [{
                        column: this.sort,
                        dir: this.sort_dir
                    }],
                    search: this.searchData,
                    type: type
                },
                responseType: 'arraybuffer'
            }).then(function (response) {
                console.log(response);
                var headers = response.headers;
                var blob = new Blob([response.data], {
                    type: headers['content-type']
                });
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                if (type == "xlsx") {
                    link.download = "export.xlsx";
                } else if (type == "csv") {
                    link.download = "export.csv";
                }

                link.click();
            });
        },
        reset() {
            this.page = 1;
            this.page_size = 25;

            this.columns.forEach(o => {
                o.dir = null;
            });

            this.searchData = {};

            this.sort = null;
            this.sort_dir = null;
            this.refresh();
        },
        refresh: function () {
            var storage = $.localStorage.get(this.dataUrl) || {};
            storage.page = this.page;
            storage.order = {
                column: this.sort,
                dir: this.sort_dir
            };
            $.localStorage.set(this.dataUrl, storage);

            this.$emit("loading");

            this.draw++;
            this.$http.get(this.dataUrl, {
                params: {
                    dataUrl: this.dataUrl,
                    draw: this.draw,
                    page: this.page,
                    length: this.page_size,
                    column: this.columns.map(function (s) {
                        return s.field;
                    }),
                    order: [
                        {
                            column: this.sort,
                            dir: this.sort_dir
                        }
                    ],
                    search: this.searchData
                }
            }).then(function (r) {
                if (r.data.draw < this.draw) {
                    return;
                }
                this.data = r.data.data;
                this.total = r.data.total;
                this.$emit("loaded");
                this.$emit("refreshed");
                this.resize();
            });
        }, resize() {

            //show all column
            this.columns.forEach((c) => {
                c.hide = false;
            });


            this.$nextTick(function () {
                this.$emit("resized");
            });

            if (!this.responsive) return;

            this.$nextTick(function () {

                //get parent width
                var parentWidth = this.$el.parentElement.offsetWidth;
                //console.log("parent width", parentWidth);
                var total = 0; //show 
                var hide_index = -1;
                this.columns.forEach((c, i) => {
                    if (hide_index >= 0) return;
                    if (total + 29 > parentWidth) {
                        hide_index = i;
                        return;
                    }

                    var w = c.$el.offsetWidth;
                    total += w;
                    if (total > parentWidth) {
                        hide_index = i;
                    }
                });
                if (hide_index >= 0) {
                    this.columns.forEach((c, i) => {
                        if (i >= hide_index) {
                            c.hide = true;
                        }
                    });
                }

                this.$emit("resized");


            });
        }
    }
});
