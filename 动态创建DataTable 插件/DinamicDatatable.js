/*
* @Author:max bai
  @Date:2019/4/4
  @Last Modified by :max bai
  @Last Modiified time:2019/4/4
**/
/**
 * 数据列表
 * @example var options = {
                title: "交易明细",
                head: ["交易时间", "交易类型", "交易金额(元)", "账户余额(元)", "操作柜员"],
                data: data,
                search: true,
                match: [2],
                placeholder: "交易金额"
            };
 $(".datatable").p_datatable(options);
 * @version 1.2.0
 * @param {JSON} options json，可不传递
 *      title：列表title，字符串，默认无
 *      head：表头，数组，默认[]
 *      data：全部数据，默认无数据
 *      order：自定义取值顺序，数组，元素为依次取值的列标，从0开始，默认按0依次取值
 *      replace：替换处理的列，可自定义填写的内容，当order的某一位设置为-1时，从replace数组中依次取值进行替换，默认填充空字符串
 *      each：每页多少条，设置为0时默认为8,-1时不分页，不显示分页组件
 *      scroll：是否启用滑动，如果为true，需要引入plugin.scrollbar.js，默认false不启用
 *      direct：默认展示第几页，编号从0开始，默认0
 *      search：是否展示搜索框，默认为false
 *      placeholder：搜索框提示信息，默认为无提示信息
 *      match：搜索时匹配第几列，默认为第1列
 */
jQuery.fn.p_datatable = function (options) {
    $(this).eq(0).empty().html('<div class="p-datatable"></div>');
    var thisV = $(this).eq(0).children(".p-datatable");
    var defaults = {
        title: "",
        head: [],
        data: [],
        order: [],
        replace: [],
        each: 8,
        scroll: false,
        direct: 0,
        search: false,
        placeholder: "",
        match: [0]
    };
    var opts = $.extend(defaults, options);
    console.log(opts);

    var methods = {
        optscur: {},
        makeup: {
            title: function (_opts) {
                var _html = "";
                if (_opts.title) {
                    _html = '<span class="p-title">' + _opts.title + '</span>';
                }
                return _html;
            },
            search: function (_opts) {
                var _html = "";
                if (_opts.search) {
                    _html = '<div class="p-search">' +
                        '<input placeholder="' + (_opts.placeholder ? _opts.placeholder : '') + '" />' +
                        '<button>搜索</button>' +
                        '</div>';
                }
                return _html;
            },
            headdiv: function (_opts) {
                if (_opts.title || _opts.search) {
                    var _html = '<div class="p-headdiv">' +
                        this.title(_opts) +
                        this.search(_opts) +
                        '</div>';
                    thisV.append(_html);
                }
            },
            tr: function (_data) {
                var _html = "";
                if (_data && _data instanceof Array && _data.length > 0) {
                    _html += "<tr>";
                    for (var i in _data) {
                        _html += "<td>" + _data[i] + "</td>";
                    }
                    _html += "</tr>";
                }
                return _html;
            },
            thead: function (_data) {
                var _html = "";
                if (_data && _data instanceof Array && _data.length > 0) {
                    _html += "<thead><tr>";
                    for (var i = 0; i < _data.length; i++) {
                        var _colspan = 1;
                        for (var j = i + 1; j < _data.length; j++) {
                            if (_data[j] != _data[i]) {
                                break;
                            }
                            else {
                                _colspan++;
                            }
                        }
                        if (_colspan > 1) {
                            _html += '<td colspan="' + _colspan + '">' + _data[i] + '</td>';
                            i += _colspan - 1;
                        }
                        else {
                            _html += "<td>" + _data[i] + "</td>";
                        }
                    }
                    _html += "</tr></thead>";
                }
                return _html;
            },
            tbody: function (_data) {
                var _html = "";
                if (_data && _data instanceof Array && _data.length > 0) {
                    _html += "<tbody>";
                    for (var i in _data) {
                        _html += this.tr(_data[i]);
                    }
                    _html += "</tbody>";
                }
                return _html;
            },
            table: function (_opts) {
                var _html = '<table class="p-table">';
                var _head = this.thead(_opts.head);
                if (_head != "") {
                    _html += _head;
                }
                _html += "</table>";
                return _html;
            },
            pagecnt: function (_opts) {
                var _pageindex = _opts.pageindex, _pagecnt = _opts.pagecnt, _trcnt = _opts.trcnt;
                if (_pagecnt > 0) {
                    _pageindex += 1;
                }
                var _html = "第{c}页/共{p}页 共{tr}条";
                _html = _html.replace("{c}", _pageindex).replace("{p}", _pagecnt).replace("{tr}", _trcnt);
                return _html;
            },
            pageturn: function (_opts) {
                var _html = '<table class="p-pageturn"><tr><td><button id="btnFirst">首页</button></td>' +
                    '<td><button id="btnPre">上一页</button></td>' +
                    '<td><span id="pagecnt"></span></td>' +
                    '<td><button id="btnNext">下一页</button></td>' +
                    '<td><button id="btnLast">末页</button></td></tr></table>';
                return _html;
            },
            datadiv: function (_opts) {
                thisV.append('<div class="p-datadiv"><div class="p-scrolldiv">' + this.table(_opts) + '</div></div>');
                var datadiv = thisV.children(".p-datadiv"), scrolldiv = datadiv.children(".p-scrolldiv");
                if (!_opts.search && !_opts.title) {
                    datadiv.css("height", "100%");
                }
                if (_opts.scroll) {
                    scrolldiv.css("height", "100%");
                }
                else if (_opts.each != -1) {
                    datadiv.append(this.pageturn(_opts));
                }
                if (_opts.scroll) {
                    datadiv.append(scrolldiv.children(".p-table").clone());
                    datadiv.children(".p-table").css({ "position": "absolute", "top": "0" });
                    scrolldiv.p_scrollbar({ "ybar": false, "xscroll": false });
                }
            },
            init: function (_opts) {
                this.headdiv(_opts);
                this.datadiv(_opts);
                this.update(_opts);
            },
            update: function (_opts) {

                var datadiv = thisV.children(".p-datadiv"), tbData = datadiv.children(".p-scrolldiv").find(".p-table"), frontTb;

                if (_opts.scroll) {
                    frontTb = datadiv.children(".p-table");
                    frontTb.hide();
                }

                tbData.children("tbody").remove();
                tbData.append(this.tbody(_opts.curdata));

                var tbPage = datadiv.children(".p-pageturn");
                tbPage.find("#pagecnt").html(this.pagecnt(_opts));

                var btnFirst = tbPage.find("#btnFirst"),
                    btnPre = tbPage.find("#btnPre"),
                    btnNext = tbPage.find("#btnNext"),
                    btnLast = tbPage.find("#btnLast");
                var _pageindex = _opts.pageindex, _pagelast = _opts.pagecnt - 1;
                if (_pageindex <= 0) {
                    btnFirst.attr("disabled", "disabled");
                    btnPre.attr("disabled", "disabled");
                }
                else {
                    btnFirst.removeAttr("disabled");
                    btnPre.removeAttr("disabled");
                }
                if (_pageindex >= _pagelast) {
                    btnNext.attr("disabled", "disabled");
                    btnLast.attr("disabled", "disabled");
                }
                else {
                    btnNext.removeAttr("disabled");
                    btnLast.removeAttr("disabled");
                }

                if (_opts.scroll) {
                    if (tbData.height() >= datadiv.children(".p-scrolldiv").height()) {
                        var frontTd = datadiv.children(".p-table").find("thead td"), backTd = tbData.find("thead td");
                        frontTd.each(function () {
                            $(this).width(backTd.eq(frontTd.index($(this))).width());
                        });
                        frontTb.show();
                    }
                }
            }
        },
        opts: {
            curdata: function (_opts) {
                var _data = _opts.showdata, _each = _opts.each, _pageindex = _opts.pageindex;
                var _begin = _each == -1 ? 0 : _pageindex * _each, _end = _each == -1 ? _data.length : (_begin + _each);
                return _data.slice(_begin, _end);
            },
            searchdata: function (_opts, _value) {
                var _data = _opts.data;
                var _newdata = [];
                for (var i = 0; i < _data.length; i++) {
                    for (var j = 0; j < _opts.match.length; j++) {
                        if (_data[i][_opts.match[j]].indexOf(_value) != -1) {
                            _newdata.push(_data[i]);
                            break;
                        }
                    }
                }
                return _newdata;
            },
            calpagecnt: function (_opts) {
                _opts.trcnt = _opts.showdata.length;
                if (_opts.scroll) {
                    _opts.each = _opts.trcnt;
                }
                _opts.pagecnt = parseInt(_opts.trcnt / _opts.each, 10);
                if (_opts.trcnt % _opts.each != 0) {
                    _opts.pagecnt += 1;
                }
                return _opts;
            },
            revise: function (_opts) {
                var _order = _opts.order;
                for (var i = 0; i < _order.length; i++) {
                    var _index = parseInt(_order[i], 10);
                    _order[i] = _index < 0 ? -1 : _index;
                }
                _opts.order = _order;

                var _match = _opts.match, __match = [];
                for (var j = 0; j < _match.length; j++) {
                    var _tmp = parseInt(_opts.match[j], 10);
                    for (var k = 0; k < _order.length; k++) {
                        if (_order[k] == _tmp) {
                            __match.push(k);
                            break;
                        }
                    }
                }
                _opts.match = __match;

                if (_opts.scroll && !thisV.p_scrollbar) {
                    _opts.scroll = false;
                }

                _opts.each = parseInt(_opts.each, 10);

                return _opts;
            },
            init: function (_opts) {

                _opts = this.revise(_opts);
                var _order = _opts.order;
                if (_order.length > 0) {
                    var _data = _opts.data, _replace = _opts.replace, _replacelen = _replace.length;
                    console.log(_data, _replace);
                    console.log(_data.length);
                    var _index = 0;
                    for (var i = 0; i < _data.length; i++) {

                        var __newdata = [];
                        for (var j = 0; j < _order.length; j++) {
                            console.log(j,_order[j]);
                            if (_order[j] == -1&& i!=0) {
                                console.log('aaaaaaaaaa',_index);
                                console.log('ssssssssss',_replace[_index]);
                                if (_index < _replacelen) {
                                    console.log('bbbbbbbbbb',_index);
                                    __newdata.push(_replace[_index]);
                                    _index++;
                                }
                                else {
                                    __newdata.push("");
                                }
                            }
                            else {
                                __newdata.push(_data[i][_order[j]]);
                                console.log(_data[i][_order[j]]);
                            }

                        }
                        console.log( _index);
                        _newdata.push(__newdata);
                    }
                    _opts.data = _newdata;
                }
                _opts.showdata = _opts.data;
                _opts = this.calpagecnt(_opts);
                if (_opts.direct) {
                    var _direct = parseInt(_opts.direct, 10);
                    if (_direct < 0) {
                        _opts.pageindex = 0;
                    }
                    else if (_direct > _opts.pagecnt - 1) {
                        _opts.pageindex = _opts.pagecnt - 1;
                    }
                    else {
                        _opts.pageindex = _direct;
                    }
                }
                else {
                    _opts.pageindex = 0;
                }
                _opts.curdata = this.curdata(_opts);
                return _opts;
            }
        },
        operate: {
            pageturn: function (_pageindex) {
                if (methods.optscur.pagecnt == 0 || (_pageindex < methods.optscur.pagecnt && _pageindex >= 0)) {
                    methods.optscur.pageindex = _pageindex;
                    methods.optscur.curdata = methods.opts.curdata(methods.optscur);
                    methods.makeup.update(methods.optscur);
                }
            },
            search: function (_opts, _value) {
                methods.optscur.showdata = methods.opts.searchdata(_opts, _value);
                methods.optscur = methods.opts.calpagecnt(methods.optscur);
                this.pageturn(0, true);
            },
            clearsearch: function (_opts, _value) {
                methods.optscur.showdata = methods.optscur.data;
                methods.optscur = methods.opts.calpagecnt(methods.optscur);
                this.pageturn(0, true);
            },
            init: function (_opts) {
                var _this = this;
                var tbPage = thisV.children(".p-datadiv").children(".p-pageturn"),
                    btnFirst = tbPage.find("#btnFirst"),
                    btnPre = tbPage.find("#btnPre"),
                    btnNext = tbPage.find("#btnNext"),
                    btnLast = tbPage.find("#btnLast");
                btnFirst.click(function () {
                    _this.pageturn(0);
                });
                btnPre.click(function () {
                    _this.pageturn(methods.optscur.pageindex - 1);
                });
                btnNext.click(function () {
                    _this.pageturn(methods.optscur.pageindex + 1);
                });
                btnLast.click(function () {
                    _this.pageturn(methods.optscur.pagecnt - 1);
                });

                if (_opts.search) {
                    var searchdiv = thisV.children(".headdiv").children(".search"), btnSearch = searchdiv.children("button"), inputSearch = searchdiv.children("input");
                    btnSearch.click(function () {
                        var matchVal = inputSearch.val();
                        if (matchVal == "") {
                            return;
                        }
                        _this.search(_opts, matchVal);
                    });
                    inputSearch.bind("input propertychange", function () {
                        if ($(this).val() == "") {
                            _this.clearsearch();
                        }
                    });
                }
            }
        },
        init: function (_opts) {
            console.log(_opts);
            this.optscur = this.opts.init(_opts);
            this.makeup.init(this.optscur);
            this.operate.init(this.optscur);
        }
    };
    methods.init(opts);
};