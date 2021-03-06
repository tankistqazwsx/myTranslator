/****************************************************************************************
* Распечатать все правила из файла productionsTable для курсача.json
*/
function printProductionTable ()
{
    var config = getDataFromServer("productionsTable.json");
    var out_message = "";
    for (nonterm in config)
    {
        var product = config[nonterm];
        var temp_string = "";
        temp_string = temp_string + nonterm.replace(/@(.*)@/, '<$1>') + ' ::= ';
        var temp = [];
        for (needed_term in product)
        {
            if (!product[needed_term] || needed_term =="EMPTY PRODUCTIONS")
            {
                if (temp_string.indexOf("ε")==-1)
                    temp.push("ε");
            }
            else if (temp_string.indexOf(product[needed_term].join(" "))==-1)
                temp.push(product[needed_term].join(" ").replace(/@(.*?)@/g, '<$1>'))
        }
        temp_string += temp.join(" | ");
        temp_string.replace(/\n/g, "")
        out_message += temp_string + "\n";
    }
    return (out_message);
}

/****************************************************************************************
* Распечатать все нетерминалы из файла productionsTable.json
*/
function printNontermsTable()
{
    var config = getDataFromServer("productionsTable.json");
    var nonterm_arr = [];
    for (nonterm in config)
        nonterm_arr.push(nonterm.replace(/@(.*)@/, '<$1>'));

    return (nonterm_arr.join(", "));

}

/****************************************************************************************
* Распечатать все терминалы из файла productionsTable.json
*/
function printTermsTable()
{
    var config = getDataFromServer("productionsTable.json");
    var term_arr = [];
    for (nonterm in config)
    {
        for (needed_term in config[nonterm])
        {
            for (key in config[nonterm][needed_term])
            {
                var term = config[nonterm][needed_term][key];
                if (term_arr.indexOf(term)==-1 && term[0]!='@')
                {
                    term_arr.push(term);
                } 
            }
        }
    }
    return (term_arr.sort().join(" "));
}

/****************************************************************************************
* Выдать переданное дерево в виде строки (нужно для вывода его на экран)
*/
function getStringTree(tree)
{
    return recursiveStrTree(tree[0]);

    function recursiveStrTree(node)
    {
        var text = "";
        if (node !== undefined)
        {
            // скобки и запятые являются управляющими символами
            // поэтому заменяем их на похожие, но другие символы
            if (node.type == '(')
                text += '❲'; 
            else if (node.type == ')')
                text += '❳'; 
            else if (node.type == ',')
                text += '،'
            else if (node.type == "id" || node.type == "const")
                text += node.body[1];
            else if (typeof(node.body)=="string")
                text += node.type;
            else if (typeof(node.body) == "object")
            {
                if (node.type[0]=='@')
                    node.type = node.type.replace(/@(.*?)@/g, "<$1>");
                text += node.type + '(' + recursiveStrTree(node.body[0]);
                //text += node.type.replace(/@(.*?)@/g, "<$1>") + '(' + recursiveStrTree(node.body[0]);

                if (text == node.type+'(' || node.body == [] || node.body.lenght == 0) // если тело пустое
                    text += "ε";
                else if (node.body[1])
                {
                    for (key in node.body)
                    {
                        if (key!=0)
                            text += ", " + recursiveStrTree(node.body[key]);
                    }
                }
                text += ')';
            }
        }
        return text;
    }
}



/****************************************************************************************
* превращает все диагональные линии в вертикальные и горизонтальные, изменяет толщину
*/
function rewriteDiagonalLines(tree)
{
    tree = tree.slice();
    const width = 2;
    var linesArray = tree.match(/<line x1="\d+" y1="\d+" x2="\d+" y2="\d+".*?\/\>/g)
    for (line in linesArray)
    {
        if (linesArray[line] != null)
        {
            var coordinates = linesArray[line].match(/"([0-9]+)"/g)
            if (coordinates != null)
            {

                var x1 = +(coordinates[0].replace(/"/g, ''));
                var y1 = +(coordinates[1].replace(/"/g, ''));
                var x2 = +(coordinates[2].replace(/"/g, ''));
                var y2 = +(coordinates[3].replace(/"/g, ''));
                if (x1 != x2)
                {
                    // заменить текущую диагональ на две вертикали и одну горизонталь
                    var y3 = (y1+y2)/2;
                    var newLine = 
                    '<line x1="'+ x1 +'" y1="'+ y1 +'" x2="'+ x1 +'" y2="'+ y3 +'" stroke="black" style="stroke-width:'+width+'px;"/>'+
                    '<line x1="'+ x2 +'" y1="'+ y2 +'" x2="'+ x2 +'" y2="'+ y3 +'" stroke="black" style="stroke-width:'+width+'px;"/>'+
                    '<line x1="'+ x1 +'" y1="'+ y3 +'" x2="'+ x2 +'" y2="'+ y3 +'" stroke="black" style="stroke-width:'+width+'px;"/>';
                    tree = tree.replace(linesArray[line], newLine);
                }
            }
        }
    }
    return tree;
}

// вообще-то было бы клево это вставить в index, но оно не вставляется
function getHTML() 
{
    return '<!DOCTYPE html> <!-- html 5 --> <html lang="en"> <head> <meta charset="UTF-8">'+
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">'+
    '<meta http-equiv="X-UA-Compatible" content="ie=edge">' +
    '</head><body><p><center><div id="run_out_id" >'+
    document.getElementById('run_out_id').innerHTML +
    "</center></p></body></html>";
}



// вернуть массив лексем для заданной программы
function lexThis(FULL = false)
{
    if (FULL)
        return lexer(document.querySelector('code.language-js'),"lex_table.json");
    else
        return lexer(document.querySelector('code.language-js'),"lex_table.json").tokenList;
}

/****************************************************************************************
* Упрощенная форма вызова парсера, принимает только флаги
*/
function parseThis(PRINT_PROCESS_OF_DERIVATION = true,
    OUTPUT_DERIVATION = false ,
     PRINT_TERMINALS = false,
      PRINT_EPSILONS = false,
      GENERATE_CODE = false)
{
   return parser(lexThis(),
   "productionsTable.json",
    PRINT_PROCESS_OF_DERIVATION,
    OUTPUT_DERIVATION,
    PRINT_TERMINALS,
    PRINT_EPSILONS,
    GENERATE_CODE);
}

function generateCode()
{
    return parseThis(false, false, false, false, true);
}

/****************************************************************************************
* Возвращает строку с процессом вывода данного кода
*/
function getDerivation()
{
   return parseThis(false, true, false, true)[1].replace(/@(.*?)@/g, "<$1>");
}

/****************************************************************************************
* Возвращает код дерева в svg формате
*/
function getTreeAsText()
{
   return document.getElementById('run_out_id').innerHTML;
}