/**
 * Sort HTML table
 * 
 * @param {HTMLTableElement} table to sort
 * @param {number} column index of column to sort
 * @param {boolean} asc determines sorting will be asc or desck
 */


function sortTableByColumn (table, column, asc = true) {
   
    const dirModifier= asc ? 1 : -1
    const tBody = table.tBodies[0];
    const row = Array.from(tBody.querySelectorAll("tr"));
    const sortedRows = row.sort((a,b) => {
        let aColText = a.querySelector(`td:nth-child(${column+1})`).textContent.trim()
        let bColText = b.querySelector(`td:nth-child(${column+1})`).textContent.trim()
        
        
        if(column == 0) {
            return aColText > bColText ? (1 * dirModifier):(-1 * dirModifier)
        }
        aColText = parseInt(aColText.replaceAll(',', ''));
        bColText = parseInt(bColText.replaceAll(',', ''));
        return aColText > bColText ? (1 * dirModifier):(-1 * dirModifier)
    })
    
    while (tBody.firstChild) {
        tBody.removeChild(tBody.firstChild);
    }
    tBody.append(...sortedRows)

    table.querySelectorAll("th").forEach(th => th.classList.remove('th-sort-asc','th-sort-desc'))
    table.querySelector(`th:nth-child(${column+1})`).classList.toggle("th-sort-asc", asc)
    table.querySelector(`th:nth-child(${column+1})`).classList.toggle("th-sort-desc", !asc)

    const box = pagination({
        table: $('#dataTable table'),
        box_mode: "list",
        page:1
    })
    box.className = "boxPagination";
    document.getElementById("table_box_bootstrap").innerHTML = ''
    document.getElementById("table_box_bootstrap").appendChild(box);

}

const thList = $('table').querySelectorAll('thead th')
thList.forEach((element, index) => {
    
    element.addEventListener('click',()=>{
        const tableElement =element.parentElement.parentElement.parentElement;
        const currentIsASC = element.classList.contains("th-sort-asc");
        sortTableByColumn(tableElement,index,!currentIsASC)
    })
})