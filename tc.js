!function(){
    class Block {
        constructor (x, y) {
            this.x = x
            this.y = y
            this.color = 'black'
            this.width = 10
            this.height = 10
        }

        static random (from = 1, to = 38) {
            return ( Math.floor( Math.random() * (to-from+1) ) + from ) * 10
        }

    }

    class Apple extends Block {
        constructor (x, y) {
            super(x, y)
            this.color = 'red'
        }
    }

    class Stage {
        constructor ( id 
                    , border = 10
                    , borderColor = 'gray'
                    , bgColor = 'white') {
            this.canvas = document.getElementById(id)
            this.ctx = canvas.getContext('2d')
            this.ctx.font = '80px 幼圆'
            this.width = canvas.width
            this.height = canvas.height
            this.border = border
            this.borderColor = borderColor
            this.bgColor = bgColor
            this.snake = null
            this.apple = null
            this.speed = 500
            this.load()
        }

        load () {
            const ctx = this.ctx
            const width = this.width
            const height = this.height
            const border = this.border
            ctx.clearRect(0, 0, width, height)
            ctx.fillStyle = this.borderColor
            ctx.fillRect(0, 0, width, height)
            ctx.fillStyle = this.bgColor
            ctx.fillRect(border, border, width - 2 * border, height - 2 * border)
        }

        clear () { 
            const from = this.border
            const width = this.width - this.border * 2
            const height = this.height - this.border * 2
            this.ctx.clearRect(from, from, width, height)
        }

        drawSnake (snake) {
            this.clear()
            if (!this.apple) {
                this.apple = this.newApple(snake)
            }
            if (snake.segments.length != snake.length) {
                this.apple = this.newApple(snake)
            } 
            snake.length = snake.segments.length
            //画蛇
            for (let i = 0 ; i < snake.length ; i++) {
                const item = snake.segments[i]
                this.ctx.fillStyle = snake.color
                this.ctx.fillRect(item.x, item.y, item.width, item.height)
            }
            //画苹果
            const apple = this.apple
            this.ctx.fillStyle = apple.color
            this.ctx.fillRect(apple.x, apple.y, apple.width, apple.height)
            
        }

        newApple (snake) {
            const flag = false
            let x, y
            do {
                x = Block.random()
                y = Block.random()
                for (let i = 0 ; i < snake.length ; i++) {
                    const item = snake.segments[i]
                    if (item.x == x && item.y == y) {
                        flag = true
                        break
                    }   
                }
            } while (flag === true)
            const apple = new Apple(x, y)
            return apple
        }

        drawGameOver () {
            this.ctx.fillStyle = 'red'
            this.ctx.fillText('Good Game', this.width/2 - 175, this.height/2)
        }

        play (snake) {
            this.snake = snake
            this.apple = this.newApple(snake)   
            let timer = setInterval(() => {
                if (this.snake.move(stage) === true) {
                    clearInterval(timer)
                    return
                }
                this.drawSnake(this.snake)
            }, this.speed)
            document.getElementsByTagName('body')[0].onkeydown = (event) => { 
                const code = event.keyCode
                //回车提供重新加载 小键盘 + -提供加减速  
                if (code == 37 || code == 38 || code == 39 || code == 40 || 
                    code == 13 || code == 107 || code == 109) {
                    switch (code) {
                        case 37 : 
                        this.snake.nextDirection = 'left'
                        break
                        case 38 : 
                        this.snake.nextDirection = 'up'
                        break
                        case 39 : 
                        this.snake.nextDirection = 'right'
                        break
                        case 40 : 
                        this.snake.nextDirection = 'down'
                        break
                        case 13 : 
                        location.reload()
                        break
                        //加速
                        case 107 : 
                        clearInterval(timer)
                        this.speed = this.speed > 100 ? this.speed - 50 : this.speed
                        console.log(this.speed)
                        timer = setInterval(() => {
                            if (this.snake.move(stage) === true) {
                                clearInterval(timer)
                                return
                            }
                            this.drawSnake(this.snake)
                        }, this.speed)
                        break
                        //减速
                        case 109 : 
                        clearInterval(timer)
                        this.speed = this.speed < 1000 ? this.speed + 50 : this.speed
                        timer = setInterval(() => {
                            if (this.snake.move(stage) === true) {
                                clearInterval(timer)
                                return
                            }
                            this.drawSnake(this.snake)
                        }, this.speed)
                        break
                    }
                }
            }

            

        }
    }

    class Snake {
        constructor (arr = [[200, 200], [210, 200], [220, 200]]) {
            this.segments = arr.map( (item) => {
                return new Block(item[0], item[1])
            })
            this.length = arr.length
            this.currentDirection = 'left'
            this.nextDirection = 'left'
            this.color = 'black'
        }

        move (stage) {
            
            let apple = stage.apple
            const head = this.segments[0]
            const cD = this.currentDirection
            const nD = this.nextDirection
            if (cD == 'left' && nD == 'right' ||
                cD == 'right' && nD == 'left' ||
                cD == 'up' && nD == 'down' ||
                cD == 'down' && nD == 'up'){
                    
            } else {
                this.currentDirection = this.nextDirection
            }
            let xMove = 0
            let yMove = 0
            switch (this.currentDirection) {
                case 'right':
                xMove = head.width
                break
                case 'left':
                xMove = -head.width
                break
                case 'up':
                yMove = -head.height
                break
                case 'down':
                yMove = head.height
            }
            const newHead = new Block(head.x + xMove, head.y + yMove)
            let dead = false
           
            //死亡事件
            for (let i = 0 ; i < this.segments.length ; i++){
                const item = this.segments[i]
                if (item.x == newHead.x && item.y == newHead.y){
                    dead = true
                    break
                }
            }
            if (dead === true ||
                newHead.x < stage.border ||
                newHead.x >= stage.width - stage.border ||
                newHead.y < stage.border ||
                newHead.y >= stage.height - stage.border)
            {
                stage.drawGameOver()
                return true    
            }
            this.segments.unshift(newHead)
            //吃苹果事件
            if (apple.x == newHead.x && apple.y == newHead.y) {
                return false
            }
            //无事件
            this.segments.pop()
            return false

        }

    }
 
    const stage = new Stage('canvas')
    const snake = new Snake()
    stage.play(snake)

}()