let headers = ["Book", "Author", "Language", "Published", "Sales"];
let data = [["The Lord of the Rings", "J. R. R. Tolkien", "English", "1954–1955", "150 million"], ["Le Petit Prince (The Little Prince)", "Antoine de Saint-Exupery", "French", "1943", "140 million"], ["Harry Potter and the Philosopher's Stone", "J. K. Rowling", "English", "1997", "107 million"], ["And Then There Were None", "Agatha Christie", "English", "1939", "100 million"], ["Dream of the Red Chamber", "Cao Xueqin", "Chinese", "1754–1791", "100 million"], ["The Hobbit", "J. R. R. Tolkien", "English", "1937", "100 million"], ["She: A History of Adventure", "H. Rider Haggard", "English", "1887", "100 million"]];
class Excel extends React.Component {
    constructor(props) {
        super(props);
        this.displayName = "Excel";
        this.state = {
            data: this.props.initialData,
            sortBy: null,
            descending: false,
            search: false
        };
        this._preSearchData = null;
        this._log = [];
        this._sort = this._sort.bind(this);
        this._showEditor = this._showEditor.bind(this);
        // this._toggleSearch = this._toggleSearch.bind(this);
        this._save = this._save.bind(this);
        this._search = this._search.bind(this);
        this._logSetState = this._logSetState.bind(this);
    }

    _sort(e) {
        let column = e.target.cellIndex;
        let data = Array.from(this.state.data);
        let descending = this.state.sortBy === column && !this.state.descending;
        data.sort((a, b) => {
            return descending ? a[column] < b[column] ? 1 : -1 : a[column] > b[column] ? 1 : -1;
        });
        this._logSetState({
            data: data,
            sortBy: column,
            descending: descending,
            edit: null
        });
    }

    _showEditor(e) {
        this._logSetState({
            edit: {
                row: parseInt(e.target.dataset.row, 10),
                cell: e.target.cellIndex
            }
        });
    }

    _save(e) {
        e.preventDefault();
        let input = e.target.firstChild,
            data = Array.from(this.state.data);
        data[this.state.edit.row][this.state.edit.cell] = input.value;
        this._logSetState({
            edit: null,
            data: data
        });
    }

    _renderTable() {
        return React.createElement(
            "table",
            null,
            React.createElement(
                "thead",
                null,
                React.createElement(
                    "tr",
                    null,
                    this.props.headers.map((title, id) => {
                        if (this.state.sortBy === id) title += this.state.descending ? ' \u2191' : ' \u2193';
                        return React.createElement(
                            "th",
                            { key: id, onClick: this._sort },
                            title
                        );
                    })
                )
            ),
            React.createElement(
                "tbody",
                { onDoubleClick: this._showEditor },
                this._renderSearch(),
                this.state.data.map((row, rowId) => {
                    return React.createElement(
                        "tr",
                        { key: rowId },
                        row.map((cell, id) => {
                            let content = cell,
                                edit = this.state.edit;
                            if (edit && edit.row === rowId && edit.cell === id) {
                                content = React.createElement(
                                    "form",
                                    { onSubmit: this._save },
                                    React.createElement("input", { type: "text", defaultValue: content })
                                );
                            }
                            return React.createElement(
                                "td",
                                { key: id, "data-row": rowId },
                                content
                            );
                        })
                    );
                })
            )
        );
    }

    _renderToolbar() {
        return React.createElement(
            "div",
            { className: "toolbar" },
            React.createElement(
                "button",
                { onClick: this._toggleSearch.bind(this) },
                "Search"
            ),
            React.createElement(
                "a",
                { href: "data.json", onClick: this._download.bind(this, "json") },
                "Export JSON"
            ),
            React.createElement(
                "a",
                { href: "data.csv", onClick: this._download.bind(this, "csv") },
                "Export CSV"
            )
        );
    }

    _download(format, ev) {
        let contents = format === "json" ? JSON.stringify(this.state.data) : this.state.data.reduce((result, row) => {
            return result + row.reduce((rowResult, cell, idx) => {
                return rowResult + '"' + cell.replace(/"/g, '""') + '"' + (idx < row.length - 1 ? "," : "");
            }, "") + "\n";
        }, ""),
            URL = window.URL || window.webkitURL,
            blob = new Blob([contents], { type: `text/${format}` });
        ev.target.href = URL.createObjectURL(blob);
        ev.target.download = `data.${format}`;
    }

    _renderSearch() {
        if (!this.state.search) {
            return false;
        }
        return React.createElement(
            "tr",
            { onChange: this._search },
            this.props.headers.map((_ignore, id) => {
                return React.createElement(
                    "td",
                    { key: id },
                    React.createElement("input", { type: "text", "data-id": id })
                );
            })
        );
    }

    _toggleSearch() {
        if (this.state.search) {
            this._logSetState({
                data: this._preSearchData,
                search: false
            });
            this._preSearchData = null;
        } else {
            this._preSearchData = this.state.data;
            this._logSetState({
                search: true
            });
        }
    }

    _search(e) {
        let needle = e.target.value.toLowerCase(),
            id = e.target.dataset.id,
            searchData;
        if (!needle) {
            this._logSetState({
                data: this._preSearchData
            });
        }
        searchData = this._preSearchData.filter(row => {
            return row[id].toString().toLowerCase().indexOf(needle) > -1;
        });
        this._logSetState({
            data: searchData
        });
    }

    _logSetState(newState) {
        this._log.push(JSON.parse(JSON.stringify(this._log.length === 0 ? this.state : newState)));
        this.setState(newState);
    }

    componentDidMount() {
        document.onkeydown = function (e) {
            if (e.shiftKey && e.altKey && e.keyCode === 82) {
                this._replay();
            }
        }.bind(this);
    }

    _replay() {
        if (this._log.length === 0) {
            console.warn("No state ro replay yet");
            return;
        }
        let idx = -1,
            interval = setInterval(function () {
            idx++;
            if (idx === this._log.length - 1) {
                clearInterval(interval);
            }
            this.setState(this._log[idx]);
        }.bind(this), 1000);
    }

    render() {
        return React.createElement(
            "div",
            null,
            this._renderToolbar(),
            this._renderTable()
        );
    }
}
Excel.PropTypes = {
    headers: PropTypes.arrayOf(PropTypes.string),
    initialData: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string))
};
ReactDOM.render(React.createElement(Excel, { headers: headers, initialData: data }), document.getElementById("root"));