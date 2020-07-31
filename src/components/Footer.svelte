<div class="Footer">
    <div class="FooterContent">
        <div>
            <a href="/docs">docs</a>
        </div>
        <div>
            <a href="https://github.com/t8/coinary-app">code</a>
        </div>
        <div>
            <a href="https://www.arweave.org/">arweave</a>
        </div>
    </div>
</div>

<style lang="sass">

.Footer
    width: 80%
    border-top: 5px solid black
    margin: 0 auto

    .FooterContent
        margin: 30px auto

        div
            width: 32%
            display: inline-block
            text-align: center

            @media screen and (max-width: 720px)
                display: inline-block
                width: 30%

        a
            text-decoration: none
            width: 100% !important
            transition: color linear 0.1s
            color: black
        
            &:hover
                transition: color linear 0.1s
                color: #C54DFD

</style>