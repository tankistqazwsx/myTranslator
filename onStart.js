window.onload = start;

function start()
{
    console.log(parser(lexThis(),"productionsTable.json",
    true, false, false))

    console.log(generateCode());

    //document.querySelector('output_code').textContent = generateCode()
    document.getElementsByClassName('output_code')[0].innerHTML = generateCode();
    
}