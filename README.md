# Brackets.io Select TextObject plugin

I am currently (and have been for a long time) in a state of flux with my current editor selection... For a while about 6 months ago I thought I would end up using VIM and even started reading a book about it. I learnt about VIM Golf, the amazing "." command, Tim Pope's awesome Surround...

I've learnt a lot about VIM but somewhere along the line it beeped at me one too many times and I felt compelled to go to something a bit more modern. I am currently trying out [Adobe's Brackets.io](http://brackets.io/) which has some neet features and even has a form of a Surround plugin which will surround your currently selected text, but the missing out is how to getting that selection.

What was needed was a way to quickly and easily easily select text... it needed VIM's select-textobject function... So I created it!!! (or at least something similar)

If you don't know VIM text objects,Here's an example of what it can do Bold itels are selections.

Suppose I have the following input:

<span class="sto_code cursor">&lt;p&gt;I have some &lt;span&gt;Text (that I want t**|**o select)&lt;/span&gt; here&lt;/p&gt;</span>
    
I could use "`iw`" for inner word:

<span class="sto_code">&lt;p&gt;I have some &lt;span&gt;Text (that I want **to** select)&lt;/span&gt; here&lt;/p&gt;</span>
    
I could use "`i(`" for inside a bracketted area:

<span class="sto_code">&lt;p&gt;I have some **&lt;span&gt;Text (that I want to select)&lt;/span&gt;** here&lt;/p&gt;</span>
    
I could use "`it`" for inside a tag:

<span class="sto_code">&lt;p&gt;I have some &lt;span&gt;**Text (that I want to select)**&lt;/span&gt; here&lt;/p&gt;</span>

I could use "`at`" for a tag:

<span class="sto_code">&lt;p&gt;I have some **&lt;span&gt;Text (that I want to select)&lt;/span&gt;** here&lt;/p&gt;</span>
    
I could use "`a<p`" to select the the "`<p>`" tag:

<span class="sto_code">&lt;p&gt;**I have some &lt;span&gt;Text (that I want to select)&lt;/span&gt; here**&lt;/p&gt;</span>
    
Which is of course identical in this case to "`i2t`" and "`2t`":

<span class="sto_code">&lt;p&gt;**I have some &lt;span&gt;Text (that I want to select)&lt;/span&gt; here**&lt;/p&gt;</span>

If you have Brackets.io installed you can go to *File > Extension Manager* and search for "select text object" and it will come up. You can also get the source, as always [at GitHub](https://github.com/forbesmyester/js.forbesmyester.select-textobject). It goes really well with the "Brackets Surround" and "Brackets Key Remapper" plugins.



<style>
span.sto_code strong { background-color: #55F; }
span.sto_code.cursor strong { background-color: #000; }
span.sto_code {
    font-family: monospace;
    margin: 1em;
    background-color: #DDD;
    padding: 0.5em;
    border: 1px #AAA solid;
    padding: 0 0;
    background-color: #DDD;
    padding: 0 0.3em;
}
</style>