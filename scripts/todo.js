let todos;

$(function () {
    chrome.storage.sync.get({
        "todos": null
    }, function (items) {
        todos = JSON.parse(items.todos);

        organizeTodos();
    });

    let isListOpened = false;

    $("#todolist").click(function (e) {
        e.preventDefault();

        if (isListOpened) {
            $("#todo-list").hide();

            isListOpened = false;
        }
        else {
            $("#todo-list").show();

            $("#add").focus();

            isListOpened = true;
        }
    });

    $("section,.weather,.menu").click(function (e) {
        if (isListOpened) {
            $("#todo-list").hide();

            isListOpened = false;
        }
    });

    $("#add").on("keypress", function (e) {
        if (e.keyCode == 13) {
            addNewTodoItem();
        }
    });

    $("#badd").click(function () {
        addNewTodoItem();
    });

    $(document).on("click", ".organize", function (e) {
        const id = $(this).parents().eq(2).attr("data-id");
        const completed = $(this).parents().eq(2).attr("data-completed");

        let newStatus;

        if (completed == "true") {
            newStatus = false;
        }
        else {
            newStatus = true;
        }

        $.each(todos, function () {
            if (this.id == id) {
                this.completed = newStatus;
                return false;
            }
        });

        chrome.storage.sync.set({
            "todos": JSON.stringify(todos)
        });
    });

    $(document).on("click", ".delete", function (e) {
        const id = $(this).parents().eq(2).attr("data-id");

        todos = todos.filter(function (todo) {
            return todo.id != id;
        });

        chrome.storage.sync.set({
            "todos": JSON.stringify(todos)
        });
    });

    $(document).on("click", "h2 a", function (e) {
        e.preventDefault();

        const notCompleted = todos.filter(function (todo) {
            return todo.completed == false;
        });

        chrome.storage.sync.set({
            "todos": JSON.stringify(notCompleted)
        });
    });
});

chrome.storage.onChanged.addListener(function (changes) {
    for (key in changes) {
        let storageChange = changes[key];

        if (key == "todos") {
            todos = JSON.parse(storageChange.newValue);

            organizeTodos();
        }
    }
});

function addNewTodoItem() {
    const item = $.trim($("#add").val());

    if (item != "") {
        if (todos == null) {
            todos = [];
        }

        const todo = {
            "id": guid(),
            "item": item,
            "date": null,
            "completed": false
        };

        todos.push(todo);

        chrome.storage.sync.set({
            "todos": JSON.stringify(todos)
        }, function () {
            $("#add").val("");
        });
    }
    else {
        $("#add").focus();
    }
}

function organizeTodos() {
    $(".todo-items").empty();

    if (todos == null || todos.length == 0) {
        $(".todo-items").html("<p class='no-items'>Items not found. Please add todo items.</p>");
    }
    else {
        const notCompleted = todos.filter(function (todo) {
            return todo.completed != true;
        });

        if (notCompleted.length > 0) {
            $(".todo-items").append("<h2>My tasks</h2><ol class='ongoing'></ol>");
        }

        $.each(notCompleted, function () {
            $(".todo-items ol.ongoing").append('<li data-completed="false" data-id="' + this.id + '"><span><em><i class="material-icons organize">check</i><i class="material-icons delete">clear</i></em>' + this.item + '</span><div class="reminder"><i class="material-icons">alarm</i>no reminder set</div></li>');
        });

        const completed = todos.filter(function (todo) {
            return todo.completed == true;
        });

        if (completed.length > 0) {
            $(".todo-items").append("<h2><a href='#'>Clear completed tasks</a>Completed tasks</h2><ol class='completed'></ol>");
        }

        $.each(completed, function () {
            $(".todo-items ol.completed").append('<li data-completed="true" data-id="' + this.id + '"><span><em><i class="material-icons organize">arrow_upward</i><i class="material-icons delete">clear</i></em>' + this.item + '</span></li>');
        });
    }
}