pagination = (config) => {
    if (typeof config != "object") throw "Paginator was expecting a config object!";
    if (typeof config.get_rows != "function" && !(config.table instanceof Element)) throw "Paginator was expecting a table or get_row function!";
    let box;
    if (!(config.box instanceof Element)) {
        config.box = document.createElement("div");
    }
    box = config.box;

    if (typeof config.get_rows != "function") {
        config.get_rows = function () {
            let table = config.table;
            let tbody = table.getElementsByTagName("tbody")[0] || table;

            // get all the possible rows for paging
            // exclude any rows that are just headers or empty
            children = tbody.children;

            let trs = [];
          

            for (let i = 0; i < children.length; i++) {
                if ((children[i].nodeType = "tr")) {
                    if (children[i].getElementsByTagName("td").length > 0) {
                        trs.push(children[i]);
                    }
                }
            }

            return trs;
        };
    }

    const get_rows = config.get_rows;
    const trs = get_rows();

    if (typeof config.rows_per_page == "undefined") {
        const selects = box.getElementsByTagName("select");
        if (typeof selects != "undefined" && selects.length > 0 && typeof selects[0].selectedIndex != "undefined") {
            config.rows_per_page = selects[0].options[selects[0].selectedIndex].value;
        } else {
            config.rows_per_page = 10;
        }
    }

    let rows_per_page = config.rows_per_page;

    if (typeof config.page == "undefined") {
        config.page = 1;
    }
    let page = config.page;

    let pages = rows_per_page > 0 ? Math.ceil(trs.length / rows_per_page) : 1;

    if (pages < 1) {
        pages = 1;
    }
    if (page > pages) {
        page = pages;
    }
    if (page < 1) {
        page = 1;
    }

    config.page = page;

    for (let i = 0; i < trs.length; i++) {
        if (typeof trs[i]["data-display"] == "undefined") {
            trs[i]["data-display"] = trs[i].style.display || "";
        }
        if (rows_per_page > 0) {
            if (i < page * rows_per_page && i >= (page - 1) * rows_per_page) {
                trs[i].style.display = trs[i]["data-display"];
            } else {
                trs[i].style.display = "none";
            }
        } else {
            trs[i].style.display = trs[i]["data-display"];
        }
    }

    config.active_class = config.active_class || "active";
    if (typeof config.box_mode != "function" && config.box_mode != "list" && config.box_mode != "buttons") {
        config.box_mode = "button";
    }
    if (typeof config.box_mode == "function") {
        config.box_mode(config);
    } else {
        let make_button;
        if (config.box_mode == "list") {
            make_button = function (symbol, index, config, disabled, active) {
                let li = document.createElement("li");
                let a = document.createElement("a");
                a.href = "#";
                a.innerHTML = symbol;
                a.addEventListener(
                    "click",
                    function (event) {
                        event.preventDefault();
                        this.parentNode.click();
                        return false;
                    },
                    false
                );
                li.appendChild(a);
                let classes = [];
                classes.push('page-number')
                if (disabled) {
                    classes.push("disabled");
                }
                if (active) {
                    classes.push(config.active_class);
                }
                li.className = classes.join(" ");
                li.addEventListener(
                    "click",
                    function () {
                        if (this.className.split(" ").indexOf("disabled") == -1) {
                            config.page = index;
                            pagination(config);
                        }
                    },
                    false
                );
                return li;
            };
        } else {
            make_button = function (symbol, index, config, disabled, active) {
                let button = document.createElement("button");
                button.innerHTML = symbol;
                button.addEventListener(
                    "click",
                    function (event) {
                        event.preventDefault();
                        if (this.disabled != true) {
                            config.page = index;
                            paginator(config);
                        }
                        return false;
                    },
                    false
                );
                if (disabled) {
                    button.disabled = true;
                }
                if (active) {
                    button.className = config.active_class;
                }
                return button;
            };
        }

        let page_box = document.createElement(config.box_mode == "list" ? "ul" : "div");
        if (config.box_mode == "list") {
            page_box.className = "pagination";
        }

        let left = make_button("&laquo;", page > 1 ? page - 1 : 1, config, page == 1, false);
        page_box.appendChild(left);

        if (pages < 5) {
            for (let i = 1; i <= pages; i++) {
                let li = make_button(i, i, config, false, page == i);
                page_box.appendChild(li);
            }
        } else {
            let liHideStart = document.createElement("li");
            liHideStart.textContent = "...";
            let liHideEnd = document.createElement("li");
            liHideEnd.textContent = "...";
            let start = 1,
                end = pages;
            if (page - 1 > 2) {
                page_box.appendChild(liHideStart);
                start = page - 2;
            }
            if (pages - page > 2) {
                end = page + 2;
            }

            for (let i = start; i <= end; i++) {
                let li = make_button(i, i, config, false, page == i);
                page_box.appendChild(li);
            }
            if (pages - page > 2) {
                page_box.appendChild(liHideEnd);
            }
        }

        let right = make_button("&raquo;", pages > page ? page + 1 : page, config, page == pages, false);
        page_box.appendChild(right);

        if (box.childNodes.length) {
            while (box.childNodes.length > 1) {
                box.removeChild(box.childNodes[0]);
            }
            box.replaceChild(page_box, box.childNodes[0]);
        } else {
            box.appendChild(page_box);
        }
    }

    let dvRecords = document.createElement("div");
    dvRecords.className = "dvrecords";
    box.appendChild(dvRecords);

    if (!(typeof config.page_options == "boolean" && !config.page_options)) {
        if (typeof config.page_options == "undefined") {
            config.page_options = [
                { value: 5, text: "5" },
                { value: 10, text: "10" },
                { value: 20, text: "20" },
                { value: 50, text: "50" },
                { value: 100, text: "100" },
                { value: 0, text: "All" },
            ];
        }
        let options = config.page_options;
        let select = document.createElement("select");
        select.className = "records";
        for (let i = 0; i < options.length; i++) {
            let o = document.createElement("option");
            o.value = options[i].value;
            o.text = options[i].text;
            select.appendChild(o);
        }
        select.value = rows_per_page;
        select.addEventListener(
            "change",
            function () {
                config.rows_per_page = this.value;
                pagination(config);
            },
            false
        );
        dvRecords.appendChild(select);
    }
    let stat = document.createElement("span");
    stat.className = "stats";
    stat.innerHTML =
        "On page " +
        page +
        " of " +
        pages +
        ", showing rows " +
        ((page - 1) * rows_per_page + 1) +
        " to " +
        (trs.length < page * rows_per_page || rows_per_page == 0 ? trs.length : page * rows_per_page) +
        " of " +
        trs.length;

    dvRecords.appendChild(stat);
    if (typeof config.tail_call == "function") {
        config.tail_call(config);
    }
    return box;
};

