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
        this._sort = this._sort.bind(this);
        this._showEditor = this._showEditor.bind(this);
        this._save = this._save.bind(this);
    }

    _sort(e) {
        let column = e.target.cellIndex;
        let data = Array.from(this.state.data);
        let descending = this.state.sortBy === column && !this.state.descending;
        data.sort((a, b) => {
            return descending ? a[column] < b[column] ? 1 : -1 : a[column] > b[column] ? 1 : -1;
        });
        this.setState({
            data: data,
            sortBy: column,
            descending: descending,
            edit: null
        });
    }

    _showEditor(e) {
        this.setState({
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
        this.setState({
            edit: null,
            data: data
        });
    }

    render() {
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
}
Excel.PropTypes = {
    headers: PropTypes.arrayOf(PropTypes.string),
    initialData: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string))
};
ReactDOM.render(React.createElement(
    "div",
    null,
    React.createElement(Excel, { headers: headers, initialData: data })
), document.getElementById("root"));