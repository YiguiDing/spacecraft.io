class Element<T> {
  prev: Element<T> | null = null;
  next: Element<T> | null = null;
  constructor(public data: T) {}
}
export type DL_Element<T> = Element<T>;
export class DolbueLinkedList<T> {
  private head: Element<T> | null = null;
  private tail: Element<T> | null = null;
  constructor() {}
  // 尾部插入
  tailPush(data: T) {
    let node = new Element(data);
    // 初始情况
    if (this.head == null || this.tail == null) {
      this.head = node;
      this.tail = node;
    } else {
      // 处理原来的尾结点和当前节点的指向关系
      this.tail.next = node;
      node.prev = this.tail;
      this.tail = node;
    }
    return node;
  }
  headPush(data: T) {
    let node = new Element(data);
    // 初始情况
    if (this.head == null || this.tail == null) {
      this.head = node;
      this.tail = node;
    } else {
      // 处理原来的头结点和当前节点的指向关系
      this.head.prev = node;
      node.next = this.head;
      this.head = node;
    }
    return node;
  }
  tailPop() {
    if (this.tail == null) {
      return null;
    } else {
      let node = this.tail;
      this.tail = this.tail.prev;
      if (this.tail != null) this.tail.next = null;
      else this.head = null; // 尾指针为null,则说明链表空了，那么一定要设置头指针为null
      return node.data;
    }
  }
  headPop() {
    if (this.head == null) {
      return null;
    } else {
      let node = this.head;
      this.head = this.head.next;
      if (this.head != null) this.head.prev = null;
      else this.tail = null; // 头节点为null,则说明链表空了，那么一定要设置尾指针为null
      return node.data;
    }
  }
  getHead() {
    if (this.head == null) return null;
    return this.head.data;
  }
  getTail() {
    if (this.tail == null) return null;
    return this.tail.data;
  }
  delete(node: Element<T>) {
    // 有前驱节点则调整前驱节点的指针
    if (node.prev) node.prev.next = node.next;
    // 否则说明是头节点，调整头指针
    else this.head = node.next;
    // 有后继节点则调整后继节点的指针
    if (node.next) node.next.prev = node.prev;
    // 否则说明是尾节点,调整尾指针
    else this.tail = node.prev;
  }
}

function test() {
  let list = new DolbueLinkedList<any>();
  list.tailPush(1);
  list.tailPush(2);
  list.tailPush(3);
  list.headPush(-1);
  list.headPush(-2);
  list.headPush(-3);
  console.dir(list, { depth: null });
  list.tailPop();
  list.tailPop();
  list.headPop();
  list.headPop();
  console.dir(list, { depth: null });
  list.tailPop();
  list.headPop();
  console.dir(list, { depth: null });
}
// test();
